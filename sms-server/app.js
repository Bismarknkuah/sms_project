const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'"]
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'st_andrews_sms',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

// Middleware to add database to request
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// JWT middleware for protected routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'st_andrews_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ===============================
// AUTHENTICATION ROUTES
// ===============================

// Login endpoint
app.post('/api/admin/auth/login', loginLimiter, async (req, res) => {
  try {
    const { role, username, password, branchId } = req.body;

    // Validation
    if (!role || !username || !password) {
      return res.status(400).json({
        message: 'Role, username, and password are required'
      });
    }

    // Build query based on whether branch is required
    let query = `
      SELECT u.*, b.branch_name, b.location 
      FROM users u 
      LEFT JOIN branches b ON u.branch_id = b.branch_code 
      WHERE (u.username = ? OR u.email = ?) 
      AND u.role = ? 
      AND u.status = 'active'
    `;

    let params = [username, username, role];

    // Super admin doesn't need branch
    if (role !== 'super_admin') {
      if (!branchId) {
        return res.status(400).json({
          message: 'Branch selection is required for this role'
        });
      }
      query += ' AND u.branch_id = ?';
      params.push(branchId);
    }

    const [users] = await pool.execute(query, params);
    const user = users[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        branchId: user.branch_id
      },
      process.env.JWT_SECRET || 'st_andrews_secret_key',
      { expiresIn: '24h' }
    );

    // Update last login
    await pool.execute(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Return success response
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        branch_id: user.branch_id,
        branch_name: user.branch_name,
        location: user.location
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// Password reset request
app.post('/api/admin/auth/reset-password', async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: 'Email and role are required' });
    }

    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND role = ? AND status = "active"',
      [email, role]
    );

    if (users.length === 0) {
      // Don't reveal if user exists or not for security
      return res.json({ message: 'If the email exists, a reset link has been sent.' });
    }

    // Generate reset token (in production, send actual email)
    const resetToken = jwt.sign(
      { userId: users[0].id, email: email },
      process.env.JWT_SECRET || 'st_andrews_secret_key',
      { expiresIn: '1h' }
    );

    // Store reset token in database (you might want to create a password_resets table)
    await pool.execute(
      'UPDATE users SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?',
      [resetToken, users[0].id]
    );

    res.json({ message: 'Password reset link has been sent to your email.' });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Password reset failed. Please try again.' });
  }
});

// Get user profile
app.get('/api/admin/auth/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT u.id, u.username, u.email, u.role, u.branch_id, u.status,
              b.branch_name, b.location, u.created_at, u.last_login
       FROM users u 
       LEFT JOIN branches b ON u.branch_id = b.branch_code 
       WHERE u.id = ?`,
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Logout (invalidate token - in production, you'd maintain a blacklist)
app.post('/api/admin/auth/logout', authenticateToken, async (req, res) => {
  try {
    // In production, add token to blacklist or remove from active sessions
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});

// ===============================
// UTILITY ROUTES
// ===============================

// Get all branches
app.get('/api/branches', async (req, res) => {
  try {
    const [branches] = await pool.execute(
      'SELECT * FROM branches WHERE status = "active" ORDER BY branch_name'
    );
    res.json(branches);
  } catch (error) {
    console.error('Branches fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch branches' });
  }
});

// Get all user roles
app.get('/api/user-roles', (req, res) => {
  const roles = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'branch_admin', label: 'Branch Admin' },
    { value: 'accountant', label: 'Accountant' },
    { value: 'transport_manager', label: 'Transport Manager' },
    { value: 'house_master', label: 'House Master' },
    { value: 'librarian', label: 'Librarian' },
    { value: 'staff', label: 'Staff' },
    { value: 'headmaster', label: 'Headmaster' },
    { value: 'pta_chairman', label: 'PTA Chairman' },
    { value: 'student', label: 'Student' },
    { value: 'it_admin', label: 'IT Admin' },
    { value: 'security_officer', label: 'Security Officer' }
  ];
  res.json(roles);
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.execute('SELECT 1');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// ===============================
// STATIC FILES & CLIENT ROUTES
// ===============================

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client/public')));
app.use('/pages', express.static(path.join(__dirname, '../client/src/pages')));

// API routes for other modules (you can add these later)
// app.use('/api/students', require('./routes/students'));
// app.use('/api/staff', require('./routes/staff'));
// app.use('/api/finance', require('./routes/finance'));
// app.use('/api/library', require('./routes/library'));
// app.use('/api/transport', require('./routes/transport'));

// ===============================
// ERROR HANDLING
// ===============================

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Serve client for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/login.html'));
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  if (error.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection lost. Attempting to reconnect...');
  }

  res.status(500).json({
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// ===============================
// SERVER STARTUP
// ===============================

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, async () => {
  console.log(`
🚀 St. Andrews SMS Server Started
📍 Environment: ${NODE_ENV}
🌐 Port: ${PORT}
📊 Database: ${dbConfig.database}@${dbConfig.host}
🕒 Started at: ${new Date().toLocaleString()}
  `);

  // Test database connection on startup
  await testConnection();

  console.log(`
📋 Available endpoints:
   POST /api/admin/auth/login
   POST /api/admin/auth/reset-password
   GET  /api/admin/auth/profile
   POST /api/admin/auth/logout
   GET  /api/branches
   GET  /api/user-roles
   GET  /api/health
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

module.exports = app;
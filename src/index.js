// src/index.js
require('dotenv').config();

const express = require('express');
const path    = require('path');
const cors    = require('cors');

const connectDB        = require('./config/db');
const { authenticate } = require('./middleware/authMiddleware');
const errorHandler     = require('./middleware/errorHandler');

// Route modules – make sure these files exist exactly as named:
const authRoutes          = require('./routes/authRoutes.js');
const studentRoutes       = require('./routes/studentRoutes.js');
const staffRoutes         = require('./routes/staffRoutes.js');
const academicRoutes      = require('./routes/academicRoutes.js');
const gradeRoutes         = require('./routes/gradeRoutes.js');
const feeRoutes           = require('./routes/feeRoutes.js');
const financeRoutes       = require('./routes/financeRoutes.js');
const communicationRoutes = require('./routes/communicationRoutes.js');
const elearningRoutes     = require('./routes/elearningRoutes.js');
const libraryRoutes       = require('./routes/libraryRoutes.js');
const transportRoutes     = require('./routes/transportRoutes.js');
const hostelRoutes        = require('./routes/hostelRoutes.js');
const analyticsRoutes     = require('./routes/analyticsRoutes.js');

const app = express();

// Connect to MongoDB
connectDB()
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Public auth
app.use('/api/auth', authRoutes);

// JWT protection
app.use('/api', authenticate);

// API endpoints
app.use('/api/student',       studentRoutes);
app.use('/api/staff',         staffRoutes);
app.use('/api/academics',     academicRoutes);
app.use('/api/grade',         gradeRoutes);
app.use('/api/fee',           feeRoutes);
app.use('/api/finance',       financeRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/elearning',     elearningRoutes);
app.use('/api/library',       libraryRoutes);
app.use('/api/transport',     transportRoutes);
app.use('/api/hostel',        hostelRoutes);
app.use('/api/analytics',     analyticsRoutes);

// Error handler
app.use(errorHandler);

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Export for testing
module.exports = app;

// Start server when run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

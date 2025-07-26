const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// MySQL Connection
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // replace with your DB password
    database: 'st_andrews_sms'
});

// Middleware
app.use(express.json());
app.use(session({
    secret: 'sms_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Serve static files from 'public'
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
console.log(`✅ Static files served from ${publicPath}`);

// Default route to serve login.html
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'login.html'));
});

// LOGIN ENDPOINT
app.post('/login', async (req, res) => {
    const { userType, branch, username, password } = req.body;
    console.log(`Login attempt: ${username} as ${userType} in branch: ${branch}`);

    try {
        let query = `
            SELECT * FROM users
            WHERE (username = ? OR email = ?)
            AND userType = ?
        `;
        let params = [username, username, userType];

        if (userType.toLowerCase() !== 'superadmin') {
            query += ' AND branch = ?';
            params.push(branch);
        }

        const [rows] = await db.execute(query, params);

        if (rows.length === 0) {
            console.warn('Login failed: user not found.');
            return res.status(401).json({ message: 'User not found or invalid credentials.' });
        }

        const user = rows[0];
        console.log('User found:', user.username);

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.warn(`Incorrect password for user: ${username}`);
            return res.status(401).json({ message: 'Invalid password.' });
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            userType: user.userType
        };

        console.log(`Login successful: ${user.username} (${user.userType})`);

        res.json({
            message: 'Login successful!',
            redirectUrl: `/dashboard/${user.userType}`
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
});

// SERVE DASHBOARDS
app.get('/dashboard/:userType', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Unauthorized. Please login.');
    }

    const dashboards = {
        superadmin: 'superadmin.html',
        admin: 'admin.html',
        teacher: 'teacher.html',
        student: 'student.html',
        parent: 'parent.html',
        accountant: 'accountant.html',
        librarian: 'librarian.html',
        transport: 'transport-manager.html',
        driver: 'driver.html'
    };

    const userType = req.params.userType.toLowerCase();
    const dashboardFile = dashboards[userType];

    if (dashboardFile) {
        console.log(`Serving dashboard for ${userType}`);
        return res.sendFile(path.join(publicPath, 'dashboards', dashboardFile));
    } else {
        console.warn(`Dashboard not found for userType: ${userType}`);
        return res.status(404).send('Dashboard not available for this role.');
    }
});

// LOGOUT
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Error logging out.');
        }
        res.redirect('/login.html');
    });
});

// START SERVER
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});

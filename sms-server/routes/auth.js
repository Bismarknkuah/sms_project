const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Import your database connection
// const db = require('../config/database'); // Adjust path as needed

router.post('/admin/auth/login', async (req, res) => {
  try {
    const { role, username, password, branchId } = req.body;

    // Query your existing database
    // Replace with your actual database query method
    const query = `
      SELECT * FROM users 
      WHERE (username = ? OR email = ?) 
      AND role = ? 
      ${branchId ? 'AND branch_id = ?' : ''}
    `;

    const params = branchId
      ? [username, username, role, branchId]
      : [username, username, role];

    // Execute query (adjust based on your DB setup)
    const users = await db.query(query, params);
    const user = users[0];

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'your_secret_key',
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          branch_id: user.branch_id
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

module.exports = router;
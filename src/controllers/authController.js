const jwt = require('jsonwebtoken');
const { jwtSecret, jwtOptions } = require('../config/auth');
const User = require('../models/User');

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || typeof user.comparePassword !== 'function' || !user.comparePassword(password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const payload = { id: user._id, role: user.role, username: user.username };
    const token = jwt.sign(payload, jwtSecret, jwtOptions);
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    next(err);
  }
}

module.exports = { login };

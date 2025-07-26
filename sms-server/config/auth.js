const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const env = require('./env');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('No token provided');

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) throw new Error('User not found');
    if (user.branchId && !user.branchId.isActive) throw new Error('Branch inactive');

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role, branchId: user.branchId },
    env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const roleBasedAccess = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

module.exports = { authMiddleware, generateToken, roleBasedAccess };
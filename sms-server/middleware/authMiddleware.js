const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Branch = require('../models/Branch');
const env = require('../config/env');
const logger = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      logger.warn('No token provided', { ip: req.ip });
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password').populate('branchId');

    if (!user) {
      logger.error('User not found', { userId: decoded.userId });
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.branchId && !user.branchId.isActive) {
      logger.warn('Access denied due to inactive branch', { branch: user.branchId.name });
      return res.status(403).json({ message: 'Access denied: Branch is inactive' });
    }

    if (new Date() > new Date(decoded.exp * 1000)) {
      logger.info('Token expired', { userId: user._id });
      return res.status(401).json({ message: 'Token expired' });
    }

    req.user = user;
    req.token = token;
    logger.info('User authenticated', { userId: user._id, role: user.role });
    next();
  } catch (error) {
    logger.error('Authentication error', { error: error.message, stack: error.stack });
    res.status(401).json({ message: error.message });
  }
};

module.exports = authMiddleware;
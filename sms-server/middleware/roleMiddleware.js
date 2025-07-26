const logger = require('../utils/logger');

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      logger.warn('Access denied due to insufficient role', {
        userId: req.user ? req.user._id : 'unauthenticated',
        role: req.user ? req.user.role : 'none',
        requiredRoles: allowedRoles
      });
      return res.status(403).json({ message: 'Access denied: Insufficient role' });
    }

    if (req.user.role === 'admin' && req.user.branchId) {
      const branchAccess = ['Assin Fosu', 'Accra', 'Mankessim', 'Takoradi', 'Sefwi Asawinso', 'Dunkwa-on-Offin', 'New Edubiase'];
      if (!branchAccess.includes(req.user.branchId.name)) {
        logger.warn('Access denied due to invalid branch', { branch: req.user.branchId.name });
        return res.status(403).json({ message: 'Access denied: Invalid branch' });
      }
    }

    logger.info('Role check passed', { userId: req.user._id, role: req.user.role });
    next();
  };
};

module.exports = roleMiddleware;
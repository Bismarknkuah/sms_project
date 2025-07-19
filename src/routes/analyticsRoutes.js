// src/routes/analyticsRoutes.js
const express = require('express');
const {
  getConfig,
  updateConfig,
  getEnrollmentStats,
  getFinanceStats
} = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticate);

router.get('/config', getConfig);
router.put('/config', updateConfig);
router.get('/enrollment', getEnrollmentStats);
router.get('/finance', getFinanceStats);

module.exports = router;

// src/routes/academicRoutes.js
const express = require('express');
const {
  getSettings,
  updateSettings,
  generateReport,
  exportReportPdf
} = require('../controllers/academicController');
const { authenticate } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticate);

// Settings
router.get('/settings', getSettings);
router.put('/settings/:id', updateSettings);

// Reports
router.get('/report', generateReport);
router.get('/report/pdf', exportReportPdf);

module.exports = router;

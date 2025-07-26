const express = require('express');
const router = express.Router();

router.get('/status', (req, res) => {
  try {
    res.json({ status: 'healthy', timestamp: new Date().toISOString(), uptime: process.uptime() });
  } catch (error) {
    res.status(500).json({ message: 'Error checking health' });
  }
});

module.exports = router;
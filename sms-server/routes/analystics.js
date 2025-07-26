const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');

router.get('/', async (req, res) => {
  try {
    const analytics = await Analytics.find();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

router.post('/', async (req, res) => {
  try {
    const analytic = new Analytics(req.body);
    await analytic.save();
    res.status(201).json(analytic);
  } catch (error) {
    res.status(400).json({ message: 'Error creating analytic' });
  }
});

module.exports = router;
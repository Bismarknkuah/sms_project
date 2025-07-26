const express = require('express');
const router = express.Router();
const Communication = require('../models/Communication');

router.get('/', async (req, res) => {
  try {
    const communications = await Communication.find();
    res.json(communications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching communications' });
  }
});

router.post('/', async (req, res) => {
  try {
    const communication = new Communication(req.body);
    await communication.save();
    res.status(201).json(communication);
  } catch (error) {
    res.status(400).json({ message: 'Error creating communication' });
  }
});

module.exports = router;
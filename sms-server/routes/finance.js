const express = require('express');
const router = express.Router();
const Finance = require('../models/Finance');

router.get('/', async (req, res) => {
  try {
    const finances = await Finance.find();
    res.json(finances);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching finances' });
  }
});

router.post('/', async (req, res) => {
  try {
    const finance = new Finance(req.body);
    await finance.save();
    res.status(201).json(finance);
  } catch (error) {
    res.status(400).json({ message: 'Error creating finance record' });
  }
});

module.exports = router;
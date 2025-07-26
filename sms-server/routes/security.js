const express = require('express');
const router = express.Router();
const Security = require('../models/Security');

router.get('/', async (req, res) => {
  try {
    const securities = await Security.find();
    res.json(securities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching securities' });
  }
});

router.post('/', async (req, res) => {
  try {
    const security = new Security(req.body);
    await security.save();
    res.status(201).json(security);
  } catch (error) {
    res.status(400).json({ message: 'Error creating security' });
  }
});

module.exports = router;
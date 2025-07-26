const express = require('express');
const router = express.Router();
const TransportManagement = require('../models/TransportManagement');

router.get('/', async (req, res) => {
  try {
    const transportManagements = await TransportManagement.find();
    res.json(transportManagements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transport managements' });
  }
});

router.post('/', async (req, res) => {
  try {
    const transportManagement = new TransportManagement(req.body);
    await transportManagement.save();
    res.status(201).json(transportManagement);
  } catch (error) {
    res.status(400).json({ message: 'Error creating transport management' });
  }
});

module.exports = router;
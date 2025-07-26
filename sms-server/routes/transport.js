const express = require('express');
const router = express.Router();
const Transport = require('../models/Transport');

router.get('/', async (req, res) => {
  try {
    const transports = await Transport.find();
    res.json(transports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transports' });
  }
});

router.post('/', async (req, res) => {
  try {
    const transport = new Transport(req.body);
    await transport.save();
    res.status(201).json(transport);
  } catch (error) {
    res.status(400).json({ message: 'Error creating transport' });
  }
});

module.exports = router;
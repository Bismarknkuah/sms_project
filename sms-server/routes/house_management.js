const express = require('express');
const router = express.Router();
const HouseManagement = require('../models/HouseManagement');

router.get('/', async (req, res) => {
  try {
    const houseManagements = await HouseManagement.find();
    res.json(houseManagements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching house managements' });
  }
});

router.post('/', async (req, res) => {
  try {
    const houseManagement = new HouseManagement(req.body);
    await houseManagement.save();
    res.status(201).json(houseManagement);
  } catch (error) {
    res.status(400).json({ message: 'Error creating house management' });
  }
});

module.exports = router;
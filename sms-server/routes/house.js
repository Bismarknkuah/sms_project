const express = require('express');
const router = express.Router();
const House = require('../models/House');

router.get('/', async (req, res) => {
  try {
    const houses = await House.find();
    res.json(houses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching houses' });
  }
});

router.post('/', async (req, res) => {
  try {
    const house = new House(req.body);
    await house.save();
    res.status(201).json(house);
  } catch (error) {
    res.status(400).json({ message: 'Error creating house' });
  }
});

module.exports = router;
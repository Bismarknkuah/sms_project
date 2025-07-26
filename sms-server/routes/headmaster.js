const express = require('express');
const router = express.Router();
const Headmaster = require('../models/Headmaster');

router.get('/', async (req, res) => {
  try {
    const headmasters = await Headmaster.find();
    res.json(headmasters);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching headmasters' });
  }
});

router.post('/', async (req, res) => {
  try {
    const headmaster = new Headmaster(req.body);
    await headmaster.save();
    res.status(201).json(headmaster);
  } catch (error) {
    res.status(400).json({ message: 'Error creating headmaster' });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Parent = require('../models/Parent');

router.get('/', async (req, res) => {
  try {
    const parents = await Parent.find();
    res.json(parents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching parents' });
  }
});

router.post('/', async (req, res) => {
  try {
    const parent = new Parent(req.body);
    await parent.save();
    res.status(201).json(parent);
  } catch (error) {
    res.status(400).json({ message: 'Error creating parent' });
  }
});

module.exports = router;
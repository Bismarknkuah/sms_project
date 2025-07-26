const express = require('express');
const router = express.Router();
const Grade = require('../models/Grade');

router.get('/', async (req, res) => {
  try {
    const grades = await Grade.find();
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching grades' });
  }
});

router.post('/', async (req, res) => {
  try {
    const grade = new Grade(req.body);
    await grade.save();
    res.status(201).json(grade);
  } catch (error) {
    res.status(400).json({ message: 'Error creating grade' });
  }
});

module.exports = router;
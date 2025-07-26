const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');

router.get('/', async (req, res) => {
  try {
    const timetables = await Timetable.find();
    res.json(timetables);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching timetables' });
  }
});

router.post('/', async (req, res) => {
  try {
    const timetable = new Timetable(req.body);
    await timetable.save();
    res.status(201).json(timetable);
  } catch (error) {
    res.status(400).json({ message: 'Error creating timetable' });
  }
});

module.exports = router;
const TimetableService = require('../services/timetableService');

exports.getAllTimetables = async (req, res) => {
  try {
    const timetables = await TimetableService.getAllTimetables();
    res.json(timetables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTimetable = async (req, res) => {
  try {
    const timetable = await TimetableService.createTimetable(req.body);
    res.status(201).json(timetable);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
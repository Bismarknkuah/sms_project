const AttendanceService = require('../services/attendanceService');

exports.getAllAttendances = async (req, res) => {
  try {
    const attendances = await AttendanceService.getAllAttendances();
    res.json(attendances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { studentId, date, status } = req.body;
    const attendance = await AttendanceService.markAttendance(studentId, date, status);
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
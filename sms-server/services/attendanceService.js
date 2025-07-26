const Attendance = require('../models/Attendance');

class AttendanceService {
  static async getAllAttendances() {
    try {
      return await Attendance.find();
    } catch (error) {
      throw new Error('Failed to fetch attendances');
    }
  }

  static async markAttendance(studentId, date, status) {
    try {
      const attendance = new Attendance({ studentId, date, status });
      return await attendance.save();
    } catch (error) {
      throw new Error('Failed to mark attendance');
    }
  }
}

module.exports = AttendanceService;
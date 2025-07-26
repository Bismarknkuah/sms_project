const Timetable = require('../models/Timetable');

class TimetableService {
  static async getAllTimetables() {
    try {
      return await Timetable.find();
    } catch (error) {
      throw new Error('Failed to fetch timetables');
    }
  }

  static async createTimetable(data) {
    try {
      const timetable = new Timetable(data);
      return await timetable.save();
    } catch (error) {
      throw new Error('Failed to create timetable');
    }
  }
}

module.exports = TimetableService;
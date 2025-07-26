const Staff = require('../models/Staff');

class StaffService {
  static async getAllStaff() {
    try {
      return await Staff.find();
    } catch (error) {
      throw new Error('Failed to fetch staff');
    }
  }

  static async createStaff(data) {
    try {
      const staff = new Staff(data);
      return await staff.save();
    } catch (error) {
      throw new Error('Failed to create staff');
    }
  }
}

module.exports = StaffService;
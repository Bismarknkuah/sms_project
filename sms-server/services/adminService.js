const Admin = require('../models/Admin');

class AdminService {
  static async getAllAdmins() {
    try {
      return await Admin.find();
    } catch (error) {
      throw new Error('Failed to fetch admins');
    }
  }

  static async createAdmin(data) {
    try {
      const admin = new Admin(data);
      return await admin.save();
    } catch (error) {
      throw new Error('Failed to create admin');
    }
  }
}

module.exports = AdminService;
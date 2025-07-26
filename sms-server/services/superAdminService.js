const SuperAdmin = require('../models/SuperAdmin');

class SuperAdminService {
  static async getAllSuperAdmins() {
    try {
      return await SuperAdmin.find();
    } catch (error) {
      throw new Error('Failed to fetch super admins');
    }
  }

  static async createSuperAdmin(data) {
    try {
      const superAdmin = new SuperAdmin(data);
      return await superAdmin.save();
    } catch (error) {
      throw new Error('Failed to create super admin');
    }
  }
}

module.exports = SuperAdminService;
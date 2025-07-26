const ITAdmin = require('../models/ITAdmin');

class ITAdminService {
  static async getAllITAdmins() {
    try {
      return await ITAdmin.find();
    } catch (error) {
      throw new Error('Failed to fetch IT admins');
    }
  }

  static async createITAdmin(data) {
    try {
      const itAdmin = new ITAdmin(data);
      return await itAdmin.save();
    } catch (error) {
      throw new Error('Failed to create IT admin');
    }
  }
}

module.exports = ITAdminService;
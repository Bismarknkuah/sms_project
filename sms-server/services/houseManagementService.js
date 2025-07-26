const HouseManagement = require('../models/HouseManagement');

class HouseManagementService {
  static async getAllHouseManagements() {
    try {
      return await HouseManagement.find();
    } catch (error) {
      throw new Error('Failed to fetch house managements');
    }
  }

  static async createHouseManagement(data) {
    try {
      const houseManagement = new HouseManagement(data);
      return await houseManagement.save();
    } catch (error) {
      throw new Error('Failed to create house management');
    }
  }
}

module.exports = HouseManagementService;
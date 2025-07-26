const House = require('../models/House');

class HouseService {
  static async getAllHouses() {
    try {
      return await House.find();
    } catch (error) {
      throw new Error('Failed to fetch houses');
    }
  }

  static async createHouse(data) {
    try {
      const house = new House(data);
      return await house.save();
    } catch (error) {
      throw new Error('Failed to create house');
    }
  }
}

module.exports = HouseService;
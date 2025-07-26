const Headmaster = require('../models/Headmaster');

class HeadmasterService {
  static async getAllHeadmasters() {
    try {
      return await Headmaster.find();
    } catch (error) {
      throw new Error('Failed to fetch headmasters');
    }
  }

  static async createHeadmaster(data) {
    try {
      const headmaster = new Headmaster(data);
      return await headmaster.save();
    } catch (error) {
      throw new Error('Failed to create headmaster');
    }
  }
}

module.exports = HeadmasterService;
const TransportManagement = require('../models/TransportManagement');

class TransportManagementService {
  static async getAllTransportManagements() {
    try {
      return await TransportManagement.find();
    } catch (error) {
      throw new Error('Failed to fetch transport managements');
    }
  }

  static async createTransportManagement(data) {
    try {
      const transportManagement = new TransportManagement(data);
      return await transportManagement.save();
    } catch (error) {
      throw new Error('Failed to create transport management');
    }
  }
}

module.exports = TransportManagementService;
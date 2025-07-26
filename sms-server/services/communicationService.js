const Communication = require('../models/Communication');

class CommunicationService {
  static async getAllCommunications() {
    try {
      return await Communication.find();
    } catch (error) {
      throw new Error('Failed to fetch communications');
    }
  }

  static async sendCommunication(data) {
    try {
      const communication = new Communication(data);
      return await communication.save();
    } catch (error) {
      throw new Error('Failed to send communication');
    }
  }
}

module.exports = CommunicationService;
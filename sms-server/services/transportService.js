const Transport = require('../models/Transport');

class TransportService {
  static async getAllTransports() {
    try {
      return await Transport.find();
    } catch (error) {
      throw new Error('Failed to fetch transports');
    }
  }

  static async createTransport(data) {
    try {
      const transport = new Transport(data);
      return await transport.save();
    } catch (error) {
      throw new Error('Failed to create transport');
    }
  }
}

module.exports = TransportService;
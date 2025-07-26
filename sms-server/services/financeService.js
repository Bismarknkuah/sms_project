const Finance = require('../models/Finance');

class FinanceService {
  static async getAllFinances() {
    try {
      return await Finance.find();
    } catch (error) {
      throw new Error('Failed to fetch finances');
    }
  }

  static async recordTransaction(data) {
    try {
      const finance = new Finance(data);
      return await finance.save();
    } catch (error) {
      throw new Error('Failed to record transaction');
    }
  }
}

module.exports = FinanceService;
const Report = require('../models/Report');

class ReportService {
  static async getAllReports() {
    try {
      return await Report.find();
    } catch (error) {
      throw new Error('Failed to fetch reports');
    }
  }

  static async generateReport(data) {
    try {
      const report = new Report(data);
      return await report.save();
    } catch (error) {
      throw new Error('Failed to generate report');
    }
  }
}

module.exports = ReportService;
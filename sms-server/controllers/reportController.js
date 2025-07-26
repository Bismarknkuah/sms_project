const ReportService = require('../services/reportService');

exports.getAllReports = async (req, res) => {
  try {
    const reports = await ReportService.getAllReports();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const report = await ReportService.generateReport(req.body);
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
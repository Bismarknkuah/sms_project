const academicService = require('../services/academicService');

/**
 * GET /api/academics/settings
 */
async function getSettings(req, res, next) {
  try {
    const cfg = await academicService.getAllRecords();
    res.json(cfg);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/academics/settings
 */
async function updateSettings(req, res, next) {
  try {
    const updated = await academicService.updateRecord(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/academics/report
 */
async function generateReport(req, res, next) {
  try {
    const { type, period } = req.query;
    const report = await academicService.generateReport(type, period);
    res.json(report);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/academics/report/pdf
 */
async function exportReportPdf(req, res, next) {
  try {
    const { type, period } = req.query;
    const report = await academicService.generateReport(type, period);
    // TODO: generate PDF buffer from report data
    // res.setHeader('Content-Type', 'application/pdf');
    // res.send(pdfBuffer);
    res.json({ message: 'PDF export not implemented yet' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSettings,
  updateSettings,
  generateReport,
  exportReportPdf
};

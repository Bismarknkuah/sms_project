const analyticsService = require('../services/analyticsService');

/**
 * GET /api/analytics/config
 */
async function getConfig(req, res, next) {
  try {
    const cfg = await analyticsService.getConfig();
    res.json(cfg);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/analytics/config
 */
async function updateConfig(req, res, next) {
  try {
    const updated = await analyticsService.updateConfig(req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/analytics/enrollment
 */
async function getEnrollmentStats(req, res, next) {
  try {
    const stats = await analyticsService.getEnrollmentStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/analytics/finance
 */
async function getFinanceStats(req, res, next) {
  try {
    const stats = await analyticsService.getFinanceStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getConfig,
  updateConfig,
  getEnrollmentStats,
  getFinanceStats
};

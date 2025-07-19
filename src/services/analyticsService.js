const AnalyticsConfig = require('../models/AnalyticsConfig');
const Student         = require('../models/Student');
const FinanceTransaction = require('../models/FinanceTransaction');

/**
 * Fetch analytics configuration.
 */
async function getConfig() {
  return AnalyticsConfig.findOne();
}

/**
 * Create or update analytics config.
 */
async function updateConfig(data) {
  return AnalyticsConfig.findOneAndUpdate({}, data, {
    new: true,
    upsert: true
  });
}

/**
 * Enrollment statistics by branch.
 */
async function getEnrollmentStats() {
  return Student.aggregate([
    { $group: { _id: '$branch', count: { $sum: 1 } } }
  ]);
}

/**
 * Finance totals by branch.
 */
async function getFinanceStats() {
  return FinanceTransaction.aggregate([
    { $group: { _id: '$branch', total: { $sum: '$amount' } } }
  ]);
}

module.exports = {
  getConfig,
  updateConfig,
  getEnrollmentStats,
  getFinanceStats
};

// src/models/AnalyticsConfig.js
const mongoose = require('mongoose');

const analyticsConfigSchema = new mongoose.Schema({
  enableEnrollmentStats: { type: Boolean, default: true },
  enableFinanceStats:    { type: Boolean, default: true },
  refreshIntervalMins:   { type: Number, default: 60, min: 1 },
  reportRecipients:      [{ type: String, match: /.+\@.+\..+/ }]  // email list
}, { timestamps: true });

module.exports = mongoose.model('AnalyticsConfig', analyticsConfigSchema);

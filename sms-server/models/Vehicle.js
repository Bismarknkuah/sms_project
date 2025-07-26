const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true, unique: true, match: /^[A-Z]{2}\d{3}[A-Z]$/ },
  model: { type: String, required: true },
  year: { type: Number, required: true, min: 2000, max: 2025 },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
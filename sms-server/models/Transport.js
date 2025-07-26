const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true, unique: true, match: /^[A-Z]{2}\d{4}$/ },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  capacity: { type: Number, required: true, min: 10, max: 60 },
  route: { type: String, required: true },
  boardingType: { type: String, enum: ['day', 'boarding'], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transport', transportSchema);
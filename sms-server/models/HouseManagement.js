const mongoose = require('mongoose');

const houseManagementSchema = new mongoose.Schema({
  houseId: { type: mongoose.Schema.Types.ObjectId, ref: 'House', required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  capacity: { type: Number, required: true, min: 50, max: 500 },
  boardingType: { type: String, enum: ['day', 'boarding'], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HouseManagement', houseManagementSchema);
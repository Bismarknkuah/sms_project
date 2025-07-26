const mongoose = require('mongoose');

const houseSchema = new mongoose.Schema({
  name: { type: String, required: true, enum: ['House 1', 'House 2', 'House 3', 'House 4'], unique: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  houseMasterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  capacity: { type: Number, required: true, min: 50, max: 200 },
  facilities: { type: [String], enum: ['dormitory', 'study_room', 'dining_hall', 'bathroom'], required: true },
  occupancyRate: { type: Number, min: 0, max: 100, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('House', houseSchema);
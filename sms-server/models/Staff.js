const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  role: { type: String, enum: ['teacher', 'librarian', 'driver', 'housemaster'], required: true },
  phoneNumber: { type: String, match: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/ },
  email: { type: String, match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/ },
  houseId: { type: mongoose.Schema.Types.ObjectId, ref: 'House', required: true },
  isHouseMaster: { type: Boolean, default: false },
  qualifications: { type: [String], required: true },
  employmentStatus: { type: String, enum: ['full_time', 'part_time', 'contract'], default: 'full_time' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Staff', staffSchema);
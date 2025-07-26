const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  studentId: { type: String, required: true, unique: true, match: /^[A-Z]{2}\d{6}$/ },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  houseId: { type: mongoose.Schema.Types.ObjectId, ref: 'House', required: function() { return this.studentType !== 'day'; } },
  studentType: { type: String, enum: ['day', 'hostel', 'boarding'], required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: true },
  dateOfBirth: { type: Date, required: true },
  emergencyContact: { type: String, match: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/ },
  healthRecords: { type: mongoose.Schema.Types.Mixed },
  academicStatus: { type: String, enum: ['active', 'suspended', 'graduated'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
// src/models/AcademicRecord.js
const mongoose = require('mongoose');

const academicRecordSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  type:    { type: String, required: true },    // e.g. 'midterm', 'final'
  period:  { type: String, required: true },    // e.g. '2025S1'
  score:   { type: Number, required: true, min: 0, max: 100 }
}, { timestamps: true });

module.exports = mongoose.model('AcademicRecord', academicRecordSchema);

// src/models/ECourse.js
const mongoose = require('mongoose');

const eCourseSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  teacherId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  students:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
}, { timestamps: true });

module.exports = mongoose.model('ECourse', eCourseSchema);

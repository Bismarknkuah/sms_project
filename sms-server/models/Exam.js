const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: { type: String, required: true, enum: ['WASSCE', 'Mock', 'Internal'] },
  date: { type: Date, required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  supervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  roomAssignment: { type: String },
  duration: { type: Number, required: true }, // in minutes
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Exam', examSchema);
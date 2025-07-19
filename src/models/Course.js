const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseId: { type: String, required: true, unique: true },
  courseName: { type: String, required: true },
  description: String,
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  class: String,
  subject: String,
  credits: Number,
  semester: String,
  academicYear: String,
  schedule: {
    days: [String],
    time: String,
    room: String
  },
  syllabus: String,
  resources: [{
    title: String,
    type: { type: String, enum: ['pdf', 'video', 'link', 'document'] },
    url: String,
    uploadDate: { type: Date, default: Date.now }
  }],
  assignments: [{
    title: String,
    description: String,
    dueDate: Date,
    totalMarks: Number,
    submissions: [{
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
      submissionDate: Date,
      fileUrl: String,
      marks: Number,
      feedback: String
    }]
  }],
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
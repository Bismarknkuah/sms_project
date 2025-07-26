const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  schedule: [{
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], required: true },
    periods: [{
      subject: { type: String, required: true },
      teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      room: { type: String }
    }]
  }],
  term: { type: String, enum: ['First', 'Second', 'Third'], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Timetable', timetableSchema);
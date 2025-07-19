// src/models/Fee.js
const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount:  { type: Number, required: true, min: 0 },
  dueDate: { type: Date, required: true },
  status:  { type: String, default: 'Due', enum: ['Due','Paid','Overdue'] }
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);

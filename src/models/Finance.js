const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  feeType: { type: String, enum: ['tuition', 'hostel', 'transport', 'library', 'exam', 'miscellaneous'], required: true },
  amount: { type: Number, required: true },
  dueDate: Date,
  paidDate: Date,
  status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
  semester: String,
  academicYear: String,
  paymentMethod: String,
  transactionId: String,
  description: String
}, { timestamps: true });
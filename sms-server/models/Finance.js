const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema({
  transactionType: { type: String, enum: ['tuition', 'boarding', 'exam_fee', 'misc'], required: true },
  amount: { type: Number, required: true, min: 0 },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash', 'mobile_money', 'bank_transfer'], default: 'cash' },
  transactionId: { type: String, unique: true },
  dueDate: { type: Date },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Finance', financeSchema);
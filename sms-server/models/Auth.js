const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  role: { type: String, enum: ['super_admin', 'admin', 'staff', 'teacher', 'parent'], required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Auth', authSchema);
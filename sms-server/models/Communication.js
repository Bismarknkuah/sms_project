const mongoose = require('mongoose');

const communicationSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  message: { type: String, required: true, maxlength: 1000 },
  type: { type: String, enum: ['email', 'sms', 'notice'], required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  sentAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

module.exports = mongoose.model('Communication', communicationSchema);
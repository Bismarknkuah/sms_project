// src/models/FinanceTransaction.js
const mongoose = require('mongoose');

const financeTransactionSchema = new mongoose.Schema({
  student:   { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  branch:    {
    type: String, required: true, enum: [
      'Assin Fosu',
      'Accra Branch',
      'Dunkwa Offin Branch',
      'Asanwinso Branch',
      'Magasim Branch'
    ]
  },
  amount:    { type: Number, required: true, min: 0 },
  date:      { type: Date, default: Date.now },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('FinanceTransaction', financeTransactionSchema);

const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema({
  name: { type: String, required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  totalBooks: { type: Number, default: 0 },
  openingHours: { type: String, default: '08:00-16:00' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Library', librarySchema);
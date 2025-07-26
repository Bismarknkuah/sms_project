const mongoose = require('mongoose');

const libraryManagementSchema = new mongoose.Schema({
  librarianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  totalBooks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LibraryManagement', libraryManagementSchema);
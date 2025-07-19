const mongoose.Schema = require('mongoose');

const librarySchema = new mongoose.Schema({
  bookId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  author: String,
  isbn: String,
  publisher: String,
  category: String,
  totalCopies: { type: Number, default: 1 },
  availableCopies: { type: Number, default: 1 },
  location: String,
  acquisitionDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['available', 'issued', 'lost', 'damaged'], default: 'available' },
  borrowHistory: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    issueDate: Date,
    returnDate: Date,
    actualReturnDate: Date,
    fine: { type: Number, default: 0 },
    status: { type: String, enum: ['issued', 'returned', 'overdue'], default: 'issued' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Library', librarySchema);
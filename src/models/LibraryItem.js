// src/models/LibraryItem.js
const mongoose = require('mongoose');

const issueRecordSchema = new mongoose.Schema({
  studentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  issueDate:   { type: Date, default: Date.now },
  returnDate:  { type: Date },
  returnedAt:  { type: Date }
}, { _id: false });

const libraryItemSchema = new mongoose.Schema({
  title:          { type: String, required: true },
  author:         { type: String, required: true },
  category:       { type: mongoose.Schema.Types.ObjectId, ref: 'ResourceCategory' },
  branch:         {
    type: String, required: true, enum: [
      'Assin Fosu',
      'Accra Branch',
      'Dunkwa Offin Branch',
      'Asanwinso Branch',
      'Magasim Branch'
    ]
  },
  totalCopies:    { type: Number, required: true, min: 0 },
  availableCopies:{ type: Number, required: true, min: 0 },
  issues:         [issueRecordSchema]
}, { timestamps: true });

module.exports = mongoose.model('LibraryItem', libraryItemSchema);

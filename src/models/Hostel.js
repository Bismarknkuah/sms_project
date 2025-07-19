// src/models/Hostel.js
const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  name:       { type: String, required: true, unique: true },
  branch:     {
    type: String, required: true, enum: [
      'Assin Fosu',
      'Accra Branch',
      'Dunkwa Offin Branch',
      'Asanwinso Branch',
      'Magasim Branch'
    ]
  },
  capacity:   { type: Number, required: true, min: 1 },
  students:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
}, { timestamps: true });

module.exports = mongoose.model('Hostel', hostelSchema);

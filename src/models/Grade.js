// src/models/Grade.js
const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  gradeName:  { type: String, required: true, unique: true },  // e.g. 'A', 'B+'
  minScore:   { type: Number, required: true, min: 0, max: 100 },
  maxScore:   { type: Number, required: true, min: 0, max: 100 },
  description:{ type: String }
}, { timestamps: true });

module.exports = mongoose.model('Grade', gradeSchema);

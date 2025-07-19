// src/models/Staff.js
const mongoose = require('mongoose');

const scheduleItemSchema = new mongoose.Schema({
  day:       { type: String, required: true, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
  startTime: { type: String, required: true },
  endTime:   { type: String, required: true }
}, { _id: false });

const staffSchema = new mongoose.Schema({
  staffId:   { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  phone:     { type: String },
  branch:    {
    type: String, required: true, enum: [
      'Assin Fosu',
      'Accra Branch',
      'Dunkwa Offin Branch',
      'Asanwinso Branch',
      'Magasim Branch'
    ]
  },
  role:      { type: String, required: true },
  schedule:  [scheduleItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);

// src/models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId:    { type: String, required: true, unique: true },
  firstName:    { type: String, required: true },
  lastName:     { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  phone:        { type: String },
  branch:       {
    type: String, required: true, enum: [
      'Assin Fosu',
      'Accra Branch',
      'Dunkwa Offin Branch',
      'Asanwinso Branch',
      'Magasim Branch'
    ]
  },
  studentType:  {
    type: String, required: true, enum: ['Day', 'Boarding', 'Hostel']
  },
  class:        { type: String, required: true },
  section:      { type: String, required: true },
  status:       { type: String, default: 'Active', enum: ['Active','Inactive'] },
  admissionDate:{ type: Date, default: Date.now },
  dateOfBirth:  { type: Date },
  gender:       { type: String, enum: ['Male','Female','Other'] },
  address:      { type: String },
  guardianName: { type: String },
  guardianPhone:{ type: String }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);

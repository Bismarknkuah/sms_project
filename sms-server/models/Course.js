const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, enum: ['General Arts', 'Science', 'Business', 'Visual Arts', 'Home Economics', 'Agricultural Science', 'Technical'] },
  code: { type: String, required: true, unique: true, uppercase: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }],
  electiveSubjects: [{ type: String, enum: ['Economics', 'Geography', 'History', 'Government', 'Literature', 'French', 'Twi', 'Ewe', 'Ga', 'Chemistry', 'Physics', 'Biology', 'Elective Math', 'Accounting', 'Costing', 'Business Management', 'Typewriting', 'Graphic Design', 'Textiles', 'Management in Living', 'Foods and Nutrition', 'Crop Husbandry', 'Animal Husbandry', 'Building Construction', 'Woodwork', 'Metalwork'] }],
  curriculumVersion: { type: String, default: '2023' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema);
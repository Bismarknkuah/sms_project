// src/services/studentService.js
const Student = require('../models/Student');

/**
 * Fetch all students.
 */
async function getAllStudents() {
  return Student.find();
}

/**
 * Fetch a single student by ID.
 */
async function getStudentById(id) {
  return Student.findById(id);
}

/**
 * Create a new student.
 */
async function createStudent(data) {
  return Student.create(data);
}

/**
 * Update an existing student by ID.
 */
async function updateStudent(id, data) {
  return Student.findByIdAndUpdate(id, data, { new: true });
}

/**
 * Delete a student by ID.
 */
async function deleteStudent(id) {
  return Student.findByIdAndDelete(id);
}

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};

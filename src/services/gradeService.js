// src/services/gradeService.js
const Grade = require('../models/Grade');

/**
 * Fetch all grade scales or entries.
 */
async function getAllGrades() {
  return Grade.find();
}

/**
 * Fetch a single grade entry by ID.
 */
async function getGradeById(id) {
  return Grade.findById(id);
}

/**
 * Create a new grade entry.
 */
async function createGrade(data) {
  return Grade.create(data);
}

/**
 * Update a grade entry by ID.
 */
async function updateGrade(id, data) {
  return Grade.findByIdAndUpdate(id, data, { new: true });
}

/**
 * Delete a grade entry by ID.
 */
async function deleteGrade(id) {
  return Grade.findByIdAndDelete(id);
}

module.exports = {
  getAllGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade
};

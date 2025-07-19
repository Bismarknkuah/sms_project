// src/services/academicService.js
const AcademicRecord = require('../models/AcademicRecord');

/**
 * Fetch all academic records.
 */
async function getAllRecords() {
  return AcademicRecord.find();
}

/**
 * Fetch a single academic record by ID.
 */
async function getRecordById(id) {
  return AcademicRecord.findById(id);
}

/**
 * Create a new academic record.
 */
async function createRecord(data) {
  return AcademicRecord.create(data);
}

/**
 * Update an academic record by ID.
 */
async function updateRecord(id, data) {
  return AcademicRecord.findByIdAndUpdate(id, data, { new: true });
}

/**
 * Delete an academic record by ID.
 */
async function deleteRecord(id) {
  return AcademicRecord.findByIdAndDelete(id);
}

/**
 * Generate a report based on filter criteria.
 * @param {string} type
 * @param {string} period
 */
async function generateReport(type, period) {
  const filter = {};
  if (type)   filter.type   = type;
  if (period) filter.period = period;
  return AcademicRecord.find(filter);
}

module.exports = {
  getAllRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
  generateReport
};

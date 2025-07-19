// src/services/staffService.js
const Staff = require('../models/Staff');

/**
 * Fetch all staff members.
 */
async function getAllStaff() {
  return Staff.find();
}

/**
 * Fetch a single staff member by ID.
 */
async function getStaffById(id) {
  return Staff.findById(id);
}

/**
 * Create a new staff member.
 */
async function createStaff(data) {
  return Staff.create(data);
}

/**
 * Update an existing staff member by ID.
 */
async function updateStaff(id, data) {
  return Staff.findByIdAndUpdate(id, data, { new: true });
}

/**
 * Delete a staff member by ID.
 */
async function deleteStaff(id) {
  return Staff.findByIdAndDelete(id);
}

module.exports = {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
};

const Hostel = require('../models/Hostel');

/**
 * Fetch all hostel entries.
 */
async function getAllHostels() {
  return Hostel.find();
}

/**
 * Fetch one hostel by ID.
 */
async function getHostelById(id) {
  return Hostel.findById(id);
}

/**
 * Create a new hostel entry.
 */
async function createHostel(data) {
  return Hostel.create(data);
}

/**
 * Update hostel by ID.
 */
async function updateHostel(id, data) {
  return Hostel.findByIdAndUpdate(id, data, { new: true });
}

/**
 * Delete a hostel by ID.
 */
async function deleteHostel(id) {
  return Hostel.findByIdAndDelete(id);
}

/**
 * Assign a student to a hostel.
 */
async function assignStudent(hostelId, studentId) {
  const hostel = await Hostel.findById(hostelId);
  if (!hostel.students.includes(studentId)) {
    hostel.students.push(studentId);
    await hostel.save();
  }
  return hostel;
}

module.exports = {
  getAllHostels,
  getHostelById,
  createHostel,
  updateHostel,
  deleteHostel,
  assignStudent
};

const Fee = require('../models/Fee');

/**
 * Fetch all fee records.
 */
async function getAllFees() {
  return Fee.find();
}

/**
 * Fetch one fee record by ID.
 */
async function getFeeById(id) {
  return Fee.findById(id);
}

/**
 * Create a new fee record.
 */
async function createFee(data) {
  return Fee.create(data);
}

/**
 * Update a fee record by ID.
 */
async function updateFee(id, data) {
  return Fee.findByIdAndUpdate(id, data, { new: true });
}

/**
 * Delete a fee record by ID.
 */
async function deleteFee(id) {
  return Fee.findByIdAndDelete(id);
}

module.exports = {
  getAllFees,
  getFeeById,
  createFee,
  updateFee,
  deleteFee
};

const FinanceTransaction = require('../models/FinanceTransaction');

/**
 * Fetch all finance transactions.
 */
async function getAllTransactions() {
  return FinanceTransaction.find();
}

/**
 * Fetch a single transaction by ID.
 */
async function getTransactionById(id) {
  return FinanceTransaction.findById(id);
}

/**
 * Create a new finance transaction.
 */
async function createTransaction(data) {
  return FinanceTransaction.create(data);
}

/**
 * Update an existing transaction by ID.
 */
async function updateTransaction(id, data) {
  return FinanceTransaction.findByIdAndUpdate(id, data, { new: true });
}

/**
 * Delete a transaction by ID.
 */
async function deleteTransaction(id) {
  return FinanceTransaction.findByIdAndDelete(id);
}

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
};

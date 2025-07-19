const financeService = require('../services/financeService');

/**
 * GET /api/finance
 */
async function getAllTransactions(req, res, next) {
  try {
    const list = await financeService.getAllTransactions();
    res.json(list);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/finance/:id
 */
async function getTransactionById(req, res, next) {
  try {
    const tx = await financeService.getTransactionById(req.params.id);
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    res.json(tx);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/finance
 */
async function createTransaction(req, res, next) {
  try {
    const tx = await financeService.createTransaction(req.body);
    res.status(201).json(tx);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/finance/:id
 */
async function updateTransaction(req, res, next) {
  try {
    const updated = await financeService.updateTransaction(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Transaction not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/finance/:id
 */
async function deleteTransaction(req, res, next) {
  try {
    const deleted = await financeService.deleteTransaction(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
};

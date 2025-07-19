const feeService = require('../services/feeService');

/**
 * GET /api/fee
 */
async function getAllFees(req, res, next) {
  try {
    const fees = await feeService.getAllFees();
    res.json(fees);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/fee/:id
 */
async function getFeeById(req, res, next) {
  try {
    const fee = await feeService.getFeeById(req.params.id);
    if (!fee) return res.status(404).json({ message: 'Fee not found' });
    res.json(fee);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/fee
 */
async function createFee(req, res, next) {
  try {
    const f = await feeService.createFee(req.body);
    res.status(201).json(f);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/fee/:id
 */
async function updateFee(req, res, next) {
  try {
    const updated = await feeService.updateFee(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Fee not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/fee/:id
 */
async function deleteFee(req, res, next) {
  try {
    const deleted = await feeService.deleteFee(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Fee not found' });
    res.json({ message: 'Fee deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllFees,
  getFeeById,
  createFee,
  updateFee,
  deleteFee
};

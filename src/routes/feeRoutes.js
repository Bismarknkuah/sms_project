// src/routes/feeRoutes.js
const express = require('express');
const {
  getAllFees,
  getFeeById,
  createFee,
  updateFee,
  deleteFee
} = require('../controllers/feeController');
const { authenticate } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticate);

router.get('/', getAllFees);
router.get('/:id', getFeeById);
router.post('/', createFee);
router.put('/:id', updateFee);
router.delete('/:id', deleteFee);

module.exports = router;

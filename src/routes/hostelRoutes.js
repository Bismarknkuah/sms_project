// src/routes/hostelRoutes.js
const express = require('express');
const {
  getAllHostels,
  getHostelById,
  createHostel,
  updateHostel,
  deleteHostel,
  assignStudent
} = require('../controllers/hostelController');
const { authenticate } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticate);

router.get('/', getAllHostels);
router.get('/:id', getHostelById);
router.post('/', createHostel);
router.put('/:id', updateHostel);
router.delete('/:id', deleteHostel);

// Assign student to hostel
router.post('/:id/assign', assignStudent);

module.exports = router;

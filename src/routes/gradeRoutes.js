// src/routes/gradeRoutes.js
const express = require('express');
const {
  getAllGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade
} = require('../controllers/gradeController');
const { authenticate } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticate);

router.get('/', getAllGrades);
router.get('/:id', getGradeById);
router.post('/', createGrade);
router.put('/:id', updateGrade);
router.delete('/:id', deleteGrade);

module.exports = router;

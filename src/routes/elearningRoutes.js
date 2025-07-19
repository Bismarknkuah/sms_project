// src/routes/elearningRoutes.js
const express = require('express');
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollStudent,
  getStudentCourses
} = require('../controllers/elearningController');
const { authenticate } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authenticate);

// Student’s enrolled courses (must come first)
router.get('/student/:studentId/courses', getStudentCourses);

// Course CRUD
router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.post('/', createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

// Enrollment
router.post('/:id/enroll', enrollStudent);

module.exports = router;

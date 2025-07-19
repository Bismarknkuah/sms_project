const elearningService = require('../services/elearningService');

/**
 * GET /api/elearning
 */
async function getAllCourses(req, res, next) {
  try {
    const courses = await elearningService.getAllCourses();
    res.json(courses);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/elearning/:id
 */
async function getCourseById(req, res, next) {
  try {
    const c = await elearningService.getCourseById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Course not found' });
    res.json(c);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/elearning
 */
async function createCourse(req, res, next) {
  try {
    const c = await elearningService.createCourse(req.body);
    res.status(201).json(c);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/elearning/:id
 */
async function updateCourse(req, res, next) {
  try {
    const updated = await elearningService.updateCourse(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Course not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/elearning/:id
 */
async function deleteCourse(req, res, next) {
  try {
    const deleted = await elearningService.deleteCourse(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course deleted' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/elearning/:id/enroll
 */
async function enrollStudent(req, res, next) {
  try {
    const updated = await elearningService.enrollStudent(req.params.id, req.body.studentId);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/elearning/student/:studentId/courses
 */
async function getStudentCourses(req, res, next) {
  try {
    const list = await elearningService.getStudentCourses(req.params.studentId);
    res.json(list);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollStudent,
  getStudentCourses
};

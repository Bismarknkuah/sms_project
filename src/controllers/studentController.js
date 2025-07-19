// src/controllers/studentController.js
const studentService = require('../services/studentService');

/**
 * GET /api/student
 * Returns all students.
 */
async function getAllStudents(req, res, next) {
  try {
    const students = await studentService.getAllStudents();
    res.json(students);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/student/:id
 * Returns one student by ID.
 */
async function getStudentById(req, res, next) {
  try {
    const student = await studentService.getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/student
 * Creates a new student.
 */
async function createStudent(req, res, next) {
  try {
    const created = await studentService.createStudent(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/student/:id
 * Updates an existing student.
 */
async function updateStudent(req, res, next) {
  try {
    const updated = await studentService.updateStudent(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/student/:id
 * Deletes a student by ID.
 */
async function deleteStudent(req, res, next) {
  try {
    const deleted = await studentService.deleteStudent(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};

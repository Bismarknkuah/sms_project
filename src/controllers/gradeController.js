const gradeService = require('../services/gradeService');

/**
 * GET /api/grade
 */
async function getAllGrades(req, res, next) {
  try {
    const grades = await gradeService.getAllGrades();
    res.json(grades);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/grade/:id
 */
async function getGradeById(req, res, next) {
  try {
    const grade = await gradeService.getGradeById(req.params.id);
    if (!grade) return res.status(404).json({ message: 'Grade not found' });
    res.json(grade);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/grade
 */
async function createGrade(req, res, next) {
  try {
    const g = await gradeService.createGrade(req.body);
    res.status(201).json(g);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/grade/:id
 */
async function updateGrade(req, res, next) {
  try {
    const updated = await gradeService.updateGrade(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Grade not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/grade/:id
 */
async function deleteGrade(req, res, next) {
  try {
    const deleted = await gradeService.deleteGrade(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Grade not found' });
    res.json({ message: 'Grade deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade
};

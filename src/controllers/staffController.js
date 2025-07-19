const staffService = require('../services/staffService');

/**
 * GET /api/staff
 */
async function getAllStaff(req, res, next) {
  try {
    const list = await staffService.getAllStaff();
    res.json(list);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/staff/:id
 */
async function getStaffById(req, res, next) {
  try {
    const staff = await staffService.getStaffById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });
    res.json(staff);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/staff
 */
async function createStaff(req, res, next) {
  try {
    const s = await staffService.createStaff(req.body);
    res.status(201).json(s);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/staff/:id
 */
async function updateStaff(req, res, next) {
  try {
    const updated = await staffService.updateStaff(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Staff not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/staff/:id
 */
async function deleteStaff(req, res, next) {
  try {
    const deleted = await staffService.deleteStaff(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Staff not found' });
    res.json({ message: 'Staff deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
};

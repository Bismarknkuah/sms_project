const hostelService = require('../services/hostelService');

/**
 * GET /api/hostel
 */
async function getAllHostels(req, res, next) {
  try {
    const list = await hostelService.getAllHostels();
    res.json(list);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/hostel/:id
 */
async function getHostelById(req, res, next) {
  try {
    const h = await hostelService.getHostelById(req.params.id);
    if (!h) return res.status(404).json({ message: 'Hostel not found' });
    res.json(h);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/hostel
 */
async function createHostel(req, res, next) {
  try {
    const h = await hostelService.createHostel(req.body);
    res.status(201).json(h);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/hostel/:id
 */
async function updateHostel(req, res, next) {
  try {
    const updated = await hostelService.updateHostel(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Hostel not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/hostel/:id
 */
async function deleteHostel(req, res, next) {
  try {
    const deleted = await hostelService.deleteHostel(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Hostel not found' });
    res.json({ message: 'Hostel deleted' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/hostel/:id/assign
 */
async function assignStudent(req, res, next) {
  try {
    const { studentId } = req.body;
    const updated = await hostelService.assignStudent(req.params.id, studentId);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllHostels,
  getHostelById,
  createHostel,
  updateHostel,
  deleteHostel,
  assignStudent
};

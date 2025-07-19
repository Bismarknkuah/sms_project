const transportService = require('../services/transportService');

/**
 * GET /api/transport/routes
 */
async function getAllRoutes(req, res, next) {
  try {
    const list = await transportService.getAllRoutes();
    res.json(list);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/transport/routes/:id
 */
async function getRouteById(req, res, next) {
  try {
    const r = await transportService.getRouteById(req.params.id);
    if (!r) return res.status(404).json({ message: 'Route not found' });
    res.json(r);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/transport/routes
 */
async function createRoute(req, res, next) {
  try {
    const r = await transportService.createRoute(req.body);
    res.status(201).json(r);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/transport/routes/:id
 */
async function updateRoute(req, res, next) {
  try {
    const updated = await transportService.updateRoute(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Route not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/transport/routes/:id
 */
async function deleteRoute(req, res, next) {
  try {
    const deleted = await transportService.deleteRoute(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Route not found' });
    res.json({ message: 'Route deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute
};

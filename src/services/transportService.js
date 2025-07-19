const Transport = require('../models/Transport');

/**
 * Fetch all transport routes.
 */
async function getAllRoutes() {
  return Transport.find();
}

/**
 * Fetch one route by ID.
 */
async function getRouteById(id) {
  return Transport.findById(id);
}

/**
 * Create a new route.
 */
async function createRoute(data) {
  return Transport.create(data);
}

/**
 * Update route by ID.
 */
async function updateRoute(id, data) {
  return Transport.findByIdAndUpdate(id, data, { new: true });
}

/**
 * Delete a route by ID.
 */
async function deleteRoute(id) {
  return Transport.findByIdAndDelete(id);
}

module.exports = {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute
};

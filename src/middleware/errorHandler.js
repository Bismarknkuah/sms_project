// src/middleware/errorHandler.js

/**
 * Global error handling middleware.
 * Logs the error and returns a JSON response with status code.
 */
function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err);
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
}

module.exports = errorHandler;

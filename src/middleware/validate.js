// src/middleware/validate.js
const { validationResult } = require('express-validator');

/**
 * Middleware to wrap express-validator result checking.
 * If there are validation errors, responds 400 with details.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  // Format: [{ field: msg }, ...]
  const extracted = errors.array().map(err => ({ [err.param]: err.msg }));
  return res.status(400).json({ errors: extracted });
}

module.exports = validate;

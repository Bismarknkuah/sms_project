const { body, param, query } = require('express-validator');

/**
 * Common validation rules for IDs.
 */
const idParam = param('id')
  .isMongoId()
  .withMessage('Invalid ID format');

/**
 * Validation for pagination & search.
 */
const pagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be ≥ 1'),
  query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be ≥ 1'),
  query('search').optional().isString().trim()
];

/**
 * Example: Student creation/update validations.
 */
const studentRules = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('branch').notEmpty().withMessage('Branch is required'),
  body('class').notEmpty().withMessage('Class is required'),
  body('section').notEmpty().withMessage('Section is required')
];

/**
 * Example: Staff creation/update validations.
 */
const staffRules = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('staffId').notEmpty().withMessage('Staff ID is required'),
  body('branch').notEmpty().withMessage('Branch is required'),
  body('role').notEmpty().withMessage('Role is required')
];

module.exports = {
  idParam,
  pagination,
  studentRules,
  staffRules
};

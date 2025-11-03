import { body, validationResult } from 'express-validator';

export const validateCreateRole = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Role name must be between 2 and 50 characters')
    .matches(/^[a-z0-9_-]+$/)
    .withMessage('Role name can only contain lowercase letters, numbers, underscores, and hyphens'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Description must be less than 255 characters'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
  body('permissions.*')
    .optional()
    .isString()
    .withMessage('Each permission must be a string'),
];

export const validateUpdateRole = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Role name must be between 2 and 50 characters')
    .matches(/^[a-z0-9_-]+$/)
    .withMessage('Role name can only contain lowercase letters, numbers, underscores, and hyphens'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Description must be less than 255 characters'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
  body('permissions.*')
    .optional()
    .isString()
    .withMessage('Each permission must be a string'),
];

export const validateAssignRole = [
  body('userId')
    .notEmpty()
    .withMessage('userId is required')
    .isUUID()
    .withMessage('userId must be a valid UUID'),
  body('roleId')
    .notEmpty()
    .withMessage('roleId is required')
    .isUUID()
    .withMessage('roleId must be a valid UUID'),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};


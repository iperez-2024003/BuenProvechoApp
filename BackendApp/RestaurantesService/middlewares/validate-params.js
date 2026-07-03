import { body, param, query, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

export const validateUuidParam = (paramName = 'id') => [
  param(paramName).notEmpty().withMessage(`El ${paramName} es requerido`),
  handleValidationErrors,
];

export const validateUserIdParam = (paramName = 'userId') => [
  param(paramName).notEmpty().withMessage(`El ${paramName} es requerido`),
  handleValidationErrors,
];

export const validateRoleNameParam = (paramName = 'roleName') => [
  param(paramName).notEmpty().withMessage(`El ${paramName} es requerido`),
  handleValidationErrors,
];

export const validateQueryPeriod = [
  query('period').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Periodo inválido'),
  handleValidationErrors,
];

export const validateQueryLimit = [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite inválido'),
  handleValidationErrors,
];

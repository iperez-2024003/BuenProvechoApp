import { body, param, query } from 'express-validator';

export const validateUuidParam = (paramName = 'id') => [
  param(paramName).notEmpty().withMessage(`El ${paramName} es requerido`),
];

export const validateUserIdParam = (paramName = 'userId') => [
  param(paramName).notEmpty().withMessage(`El ${paramName} es requerido`),
];

export const validateRoleNameParam = (paramName = 'roleName') => [
  param(paramName).notEmpty().withMessage(`El ${paramName} es requerido`),
];

export const validateQueryPeriod = [
  query('period').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Periodo inválido'),
];

export const validateQueryLimit = [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite inválido'),
];

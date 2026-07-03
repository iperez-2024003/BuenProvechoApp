'use strict';

import { param, query, body } from 'express-validator';
import { handleValidationErrors } from './validation.js';
import { isValidUserId } from '../helpers/uuid-generator.js';
import { ALLOWED_ROLES } from '../helpers/role-constants.js';

/**
 * Valida un parÃ¡metro de ruta que debe ser UUID (restaurantes, menÃºs, pedidos, reservas, eventos, mesas, etc.)
 */
export const validateUuidParam = (paramName = 'id') => [
  param(paramName)
    .isString()
    .withMessage(`${paramName} debe ser un UUID vÃ¡lido`),
  handleValidationErrors,
];

/**
 * Valida varios parÃ¡metros de ruta que deben ser UUID (ej: id e itemId)
 */
export const validateUuidParams = (...paramNames) => {
  const validations = paramNames.map((name) =>
    param(name).isString().withMessage(`${name} debe ser un UUID vÃ¡lido`)
  );
  return [...validations, handleValidationErrors];
};

/**
 * Valida un parÃ¡metro de ruta que debe ser userId (formato usr_xxx de 16 caracteres)
 */
export const validateUserIdParam = (paramName = 'userId') => [
  param(paramName)
    .notEmpty()
    .withMessage(`${paramName} es requerido`)
    .custom((value) => {
      if (!isValidUserId(value)) {
        throw new Error(`${paramName} debe tener formato vÃ¡lido (ej: usr_xxxxxxxxxxxx)`);
      }
      return true;
    }),
  handleValidationErrors,
];

/**
 * Valida roleName en params (solo ADMIN_ROLE o USER_ROLE; acepta mayÃºsculas/minÃºsculas)
 */
export const validateRoleNameParam = () => [
  param('roleName')
    .notEmpty()
    .withMessage('roleName es requerido')
    .trim()
    .custom((value) => {
      const normalized = (value || '').toUpperCase();
      if (!ALLOWED_ROLES.includes(normalized)) {
        throw new Error('roleName no es un rol válido del sistema');
      }
      return true;
    }),
  handleValidationErrors,
];

/**
 * Valida body userId para getProfileById (formato usr_xxx)
 */
export const validateProfileByIdBody = [
  body('userId')
    .notEmpty()
    .withMessage('userId es requerido')
    .custom((value) => {
      if (!isValidUserId(value)) {
        throw new Error('userId debe tener formato vÃ¡lido (ej: usr_xxxxxxxxxxxx)');
      }
      return true;
    }),
  handleValidationErrors,
];

/** Query opcional period (week | month | year) para estadÃ­sticas de pedidos */
export const validateQueryPeriod = [
  query('period')
    .optional()
    .isIn(['week', 'month', 'year'])
    .withMessage('period debe ser week, month o year'),
  handleValidationErrors,
];

/** Query opcional limit (1-100) para estadÃ­sticas de platos populares */
export const validateQueryLimit = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit debe ser entre 1 y 100'),
  handleValidationErrors,
];

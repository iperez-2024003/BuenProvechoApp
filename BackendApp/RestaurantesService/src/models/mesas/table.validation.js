'use strict';

import { body, query, validationResult } from 'express-validator';

const handleErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      message: 'Validation errors',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

export const validateTableCreation = [
  body('table_number').notEmpty().withMessage('Table number is required').isInt({ min: 1 }).withMessage('Table number must be at least 1'),
  body('capacity').notEmpty().withMessage('Capacity is required').isInt({ min: 1, max: 20 }).withMessage('Capacity must be between 1 and 20'),
  body('location').optional().isIn(['interior', 'terrace', 'vip', 'bar', 'window', 'private']).withMessage('Invalid location'),
  body('floor').optional().isInt({ min: 1 }).withMessage('Floor must be at least 1'),
  body('restaurant_id').notEmpty().withMessage('Restaurant ID is required').isString().withMessage('Restaurant ID must be a valid String/ID'),
  handleErrors,
];

export const validateTableUpdate = [
  body('table_number').optional().isInt({ min: 1 }).withMessage('Table number must be at least 1'),
  body('capacity').optional().isInt({ min: 1, max: 20 }).withMessage('Capacity must be between 1 and 20'),
  body('location').optional().isIn(['interior', 'terrace', 'vip', 'bar', 'window', 'private']).withMessage('Invalid location'),
  body('floor').optional().isInt({ min: 1 }).withMessage('Floor must be at least 1'),
  body('status').optional().isIn(['available', 'occupied', 'reserved', 'cleaning']).withMessage('Invalid status'),
  handleErrors,
];

/** Validación para PATCH /:id/status (cambiar estado de mesa) */
export const validateTableStatusUpdate = [
  body('status')
    .notEmpty()
    .withMessage('El estado de la mesa es requerido')
    .isIn(['available', 'occupied', 'reserved', 'cleaning'])
    .withMessage('El estado debe ser: available, occupied, reserved o cleaning'),
  handleErrors,
];

/** Validación de query para GET /available */
export const validateGetAvailableTablesQuery = [
  query('restaurant_id')
    .notEmpty()
    .withMessage('restaurant_id es requerido')
    .isString()
    .withMessage('restaurant_id debe ser un UUID válido'),
  query('capacity').optional().isInt({ min: 1, max: 20 }).withMessage('capacity debe ser entre 1 y 20'),
  query('location').optional().isIn(['interior', 'terrace', 'vip', 'bar', 'window', 'private']).withMessage('location no válida'),
  handleErrors,
];

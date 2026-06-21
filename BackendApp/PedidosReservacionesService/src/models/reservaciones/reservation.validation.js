'use strict';

import { body, query, validationResult } from 'express-validator';

/**
 * Validation middleware for reservation creation
 */
export const validateReservationCreation = [
  body('restaurant_id')
    .notEmpty()
    .withMessage('Restaurant ID is required')
    .isString()
    .withMessage('Restaurant ID must be a valid String/ID'),

  body('user_id')
    .optional()
    .isString()
    .withMessage('User ID must be a valid String/ID'),

  body('customer_name')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Customer name must be between 2 and 150 characters'),

  body('customer_phone')
    .trim()
    .notEmpty()
    .withMessage('Customer phone is required')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid phone number format'),

  body('customer_email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('reservation_date')
    .notEmpty()
    .withMessage('Reservation date is required')
    .isDate()
    .withMessage('Must be a valid date (YYYY-MM-DD)'),

  body('reservation_time')
    .notEmpty()
    .withMessage('Reservation time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('Reservation time must be in HH:MM:SS format'),

  body('party_size')
    .notEmpty()
    .withMessage('Party size is required')
    .isInt({ min: 1, max: 20 })
    .withMessage('Party size must be between 1 and 20 people'),

  body('special_requests')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Special requests cannot exceed 1000 characters'),

  body('table_preference')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Table preference cannot exceed 100 characters'),

  body('occasion')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Occasion cannot exceed 100 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        message: 'Validation errors',
        errors: errors.array().map((error) => ({
          field: error.path,
          message: error.msg,
        })),
      });
    }
    next();
  },
];

/**
 * Validation middleware for reservation update
 */
export const validateReservationUpdate = [
  body('customer_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Customer name must be between 2 and 150 characters'),

  body('customer_phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid phone number format'),

  body('customer_email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('reservation_date')
    .optional()
    .isDate()
    .withMessage('Must be a valid date (YYYY-MM-DD)'),

  body('reservation_time')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('Reservation time must be in HH:MM:SS format'),

  body('party_size')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Party size must be between 1 and 20 people'),

  body('special_requests')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Special requests cannot exceed 1000 characters'),

  body('table_preference')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Table preference cannot exceed 100 characters'),

  body('occasion')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Occasion cannot exceed 100 characters'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        message: 'Validation errors',
        errors: errors.array().map((error) => ({
          field: error.path,
          message: error.msg,
        })),
      });
    }
    next();
  },
];

/**
 * Validación de query para check-availability (GET /check-availability)
 */
export const validateCheckAvailability = [
  query('restaurant_id')
    .notEmpty()
    .withMessage('restaurant_id es requerido')
    .isString()
    .withMessage('restaurant_id debe ser un UUID válido'),
  query('reservation_date')
    .notEmpty()
    .withMessage('reservation_date es requerido (YYYY-MM-DD)')
    .isDate()
    .withMessage('reservation_date debe ser una fecha válida (YYYY-MM-DD)'),
  query('reservation_time')
    .notEmpty()
    .withMessage('reservation_time es requerido')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/)
    .withMessage('reservation_time debe ser HH:MM o HH:MM:SS'),
  query('party_size')
    .notEmpty()
    .withMessage('party_size es requerido')
    .isInt({ min: 1, max: 20 })
    .withMessage('party_size debe ser entre 1 y 20'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        message: 'Validation errors',
        errors: errors.array().map((error) => ({ field: error.path, message: error.msg })),
      });
    }
    next();
  },
];

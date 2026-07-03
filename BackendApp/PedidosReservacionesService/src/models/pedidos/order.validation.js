'use strict';

import { body, validationResult } from 'express-validator';

/**
 * Validation middleware for order creation
 */
export const validateOrderCreation = [
  body('restaurant_id')
    .notEmpty()
    .withMessage('Restaurant ID is required')
    .isString()
    .withMessage('Restaurant ID must be a valid String/ID'),

  body('user_id')
    .notEmpty()
    .withMessage('User ID is required')
    .isString()
    .withMessage('User ID must be a valid String/ID'),

  body('customer_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Customer name must be between 2 and 150 characters'),

  body('order_type')
    .optional()
    .isIn(['dine_in', 'takeout', 'delivery'])
    .withMessage('Invalid order type'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('Items array is required and must contain at least one item'),

  body('items.*.menu_item_id')
    .notEmpty()
    .withMessage('Menu item ID is required for each item')
    .isString()
    .withMessage('Menu item ID must be a valid String/ID'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required for each item')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  body('items.*.special_instructions')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Special instructions cannot exceed 255 characters'),

  body('items.*.notes')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Notes cannot exceed 255 characters'),

  body('items.*.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),

  body('delivery_address')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Delivery address cannot exceed 255 characters'),

  body('delivery_fee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Delivery fee must be a positive number'),

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
 * Validation middleware for adding item to order
 */
export const validateAddItem = [
  body('menu_item_id')
    .notEmpty()
    .withMessage('Menu item ID is required')
    .isString()
    .withMessage('Menu item ID must be a valid String/ID'),

  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  body('special_instructions')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Special instructions cannot exceed 255 characters'),

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

const VALID_ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled'];

/**
 * ValidaciÃ³n para actualizar estado del pedido (PATCH /:id/status)
 */
export const validateOrderStatusUpdate = [
  body('status')
    .notEmpty()
    .withMessage('El estado del pedido es requerido')
    .isIn(VALID_ORDER_STATUSES)
    .withMessage(`El estado debe ser uno de: ${VALID_ORDER_STATUSES.join(', ')}`),
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

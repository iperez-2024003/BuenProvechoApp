'use strict';

import { body, validationResult } from 'express-validator';

/**
 * Validation middleware for menu category creation
 */
export const validateMenuCreation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Menu category name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Menu category name must be between 2 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('restaurant_id')
    .notEmpty()
    .withMessage('Restaurant ID is required')
    .isString()
    .withMessage('Restaurant ID must be a valid String/ID'),

  body('display_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer'),

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
 * Validation middleware for menu category update
 */
export const validateMenuUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Menu category name must be between 2 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('display_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer'),

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
 * Validation middleware for menu item creation
 */
export const validateMenuItemCreation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Menu item name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Menu item name must be between 2 and 150 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('menu_id')
    .notEmpty()
    .withMessage('Menu category ID is required')
    .isString()
    .withMessage('Menu category ID must be a valid String/ID'),

  body('restaurant_id')
    .notEmpty()
    .withMessage('Restaurant ID is required')
    .isString()
    .withMessage('Restaurant ID must be a valid String/ID'),

  body('image_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image URL must be a valid URL'),

  body('ingredients')
    .optional()
    .isArray()
    .withMessage('Ingredients must be an array'),

  body('allergens')
    .optional()
    .isArray()
    .withMessage('Allergens must be an array'),

  body('preparation_time')
    .optional()
    .isInt({ min: 1, max: 180 })
    .withMessage('Preparation time must be between 1 and 180 minutes'),

  body('calories')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Calories must be a non-negative integer'),

  body('is_vegetarian')
    .optional()
    .isBoolean()
    .withMessage('is_vegetarian must be a boolean'),

  body('is_vegan')
    .optional()
    .isBoolean()
    .withMessage('is_vegan must be a boolean'),

  body('is_gluten_free')
    .optional()
    .isBoolean()
    .withMessage('is_gluten_free must be a boolean'),

  body('spice_level')
    .optional()
    .isIn(['none', 'mild', 'medium', 'hot', 'extra_hot'])
    .withMessage('Invalid spice level'),

  body('portion_size')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Portion size cannot exceed 50 characters'),

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
 * Validation middleware for menu item update
 */
export const validateMenuItemUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Menu item name must be between 2 and 150 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('menu_id')
    .optional()
    .isString()
    .withMessage('Menu category ID must be a valid String/ID'),

  body('image_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image URL must be a valid URL'),

  body('ingredients')
    .optional()
    .isArray()
    .withMessage('Ingredients must be an array'),

  body('allergens')
    .optional()
    .isArray()
    .withMessage('Allergens must be an array'),

  body('preparation_time')
    .optional()
    .isInt({ min: 1, max: 180 })
    .withMessage('Preparation time must be between 1 and 180 minutes'),

  body('calories')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Calories must be a non-negative integer'),

  body('is_vegetarian')
    .optional()
    .isBoolean()
    .withMessage('is_vegetarian must be a boolean'),

  body('is_vegan')
    .optional()
    .isBoolean()
    .withMessage('is_vegan must be a boolean'),

  body('is_gluten_free')
    .optional()
    .isBoolean()
    .withMessage('is_gluten_free must be a boolean'),

  body('spice_level')
    .optional()
    .isIn(['none', 'mild', 'medium', 'hot', 'extra_hot'])
    .withMessage('Invalid spice level'),

  body('portion_size')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Portion size cannot exceed 50 characters'),

  body('is_available')
    .optional()
    .isBoolean()
    .withMessage('is_available must be a boolean'),

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

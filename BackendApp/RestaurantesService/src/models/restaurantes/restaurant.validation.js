'use strict';

import { body, validationResult } from 'express-validator';

/**
 * Validation middleware for restaurant creation
 */
export const validateRestaurantCreation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Restaurant name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Restaurant name must be between 3 and 100 characters')
    .matches(/^[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s\-'&,.\/]+$/)
    .withMessage('Restaurant name contains invalid characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 10, max: 255 })
    .withMessage('Address must be between 10 and 255 characters'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid phone number format')
    .isLength({ min: 8, max: 20 })
    .withMessage('Phone number must be between 8 and 20 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('category')
    .notEmpty()
    .withMessage('Restaurant category is required')
    .isIn([
      'casual',
      'fine_dining',
      'fast_food',
      'cafe',
      'bakery',
      'bar',
      'food_truck',
      'buffet',
      'family_style',
      'gourmet',
      'other',
    ])
    .withMessage('Invalid restaurant category'),

  body('cuisine_type')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Cuisine type must be between 2 and 50 characters'),

  body('price_range')
    .notEmpty()
    .withMessage('Price range is required')
    .isIn(['$', '$$', '$$$', '$$$$'])
    .withMessage('Invalid price range. Must be $, $$, $$$, or $$$$'),

  body('average_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Average price must be a positive number'),

  body('capacity')
    .notEmpty()
    .withMessage('Capacity is required')
    .isInt({ min: 1, max: 10000 })
    .withMessage('Capacity must be between 1 and 10000'),

  body('opening_time')
    .notEmpty()
    .withMessage('Opening time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('Opening time must be in HH:MM:SS format'),

  body('closing_time')
    .notEmpty()
    .withMessage('Closing time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('Closing time must be in HH:MM:SS format'),

  body('operating_days')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Operating days must be an array with at least one day')
    .custom((days) => {
      const validDays = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ];
      const allValid = days.every((day) =>
        validDays.includes(day.toLowerCase())
      );
      if (!allValid) {
        throw new Error('Invalid day in operating_days array');
      }
      return true;
    }),

  body('logo_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Logo URL must be a valid URL'),

  body('cover_image_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Cover image URL must be a valid URL'),

  body('accepts_reservations')
    .optional()
    .isBoolean()
    .withMessage('accepts_reservations must be a boolean'),

  body('accepts_takeout')
    .optional()
    .isBoolean()
    .withMessage('accepts_takeout must be a boolean'),

  body('accepts_delivery')
    .optional()
    .isBoolean()
    .withMessage('accepts_delivery must be a boolean'),

  body('parking_available')
    .optional()
    .isBoolean()
    .withMessage('parking_available must be a boolean'),

  body('wifi_available')
    .optional()
    .isBoolean()
    .withMessage('wifi_available must be a boolean'),

  body('outdoor_seating')
    .optional()
    .isBoolean()
    .withMessage('outdoor_seating must be a boolean'),

  body('pet_friendly')
    .optional()
    .isBoolean()
    .withMessage('pet_friendly must be a boolean'),

  body('wheelchair_accessible')
    .optional()
    .isBoolean()
    .withMessage('wheelchair_accessible must be a boolean'),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('website_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Website URL must be a valid URL'),

  body('social_media')
    .optional()
    .isObject()
    .withMessage('Social media must be an object'),

  body('payment_methods')
    .optional()
    .isArray()
    .withMessage('Payment methods must be an array'),

  body('special_features')
    .optional()
    .isArray()
    .withMessage('Special features must be an array'),

  body('admin_id')
    .notEmpty()
    .withMessage('Administrator ID is required')
    .isString()
    .isLength({ min: 10, max: 36 })
    .withMessage('Administrator ID must be a valid String/ID'),

  body('parent_restaurant_id')
    .optional()
    .isString()
    .withMessage('Parent restaurant ID must be a valid String/ID'),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        message: 'Validation errors',
        errors: errors.array().map((error) => ({
          field: error.path,
          message: error.msg,
          value: error.value,
        })),
      });
    }
    next();
  },
];

/**
 * Validation middleware for restaurant update
 */
export const validateRestaurantUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Restaurant name must be between 3 and 100 characters')
    .matches(/^[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s\-'&,.\/]+$/)
    .withMessage('Restaurant name contains invalid characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('address')
    .optional()
    .trim()
    .isLength({ min: 10, max: 255 })
    .withMessage('Address must be between 10 and 255 characters'),

  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid phone number format')
    .isLength({ min: 8, max: 20 })
    .withMessage('Phone number must be between 8 and 20 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('category')
    .optional()
    .isIn([
      'casual',
      'fine_dining',
      'fast_food',
      'cafe',
      'bakery',
      'bar',
      'food_truck',
      'buffet',
      'family_style',
      'gourmet',
      'other',
    ])
    .withMessage('Invalid restaurant category'),

  body('cuisine_type')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Cuisine type must be between 2 and 50 characters'),

  body('price_range')
    .optional()
    .isIn(['$', '$$', '$$$', '$$$$'])
    .withMessage('Invalid price range'),

  body('average_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Average price must be a positive number'),

  body('capacity')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Capacity must be between 1 and 10000'),

  body('opening_time')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('Opening time must be in HH:MM:SS format'),

  body('closing_time')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('Closing time must be in HH:MM:SS format'),

  body('operating_days')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Operating days must be an array with at least one day')
    .custom((days) => {
      const validDays = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ];
      const allValid = days.every((day) =>
        validDays.includes(day.toLowerCase())
      );
      if (!allValid) {
        throw new Error('Invalid day in operating_days array');
      }
      return true;
    }),

  body('logo_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Logo URL must be a valid URL'),

  body('cover_image_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Cover image URL must be a valid URL'),

  body('accepts_reservations')
    .optional()
    .isBoolean()
    .withMessage('accepts_reservations must be a boolean'),

  body('accepts_takeout')
    .optional()
    .isBoolean()
    .withMessage('accepts_takeout must be a boolean'),

  body('accepts_delivery')
    .optional()
    .isBoolean()
    .withMessage('accepts_delivery must be a boolean'),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('website_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Website URL must be a valid URL'),

  body('admin_id')
    .notEmpty()
    .withMessage('Administrator ID is required')
    .isString()
    .isLength({ min: 10, max: 36 })
    .withMessage('Administrator ID must be between 10 and 36 characters'), 

  body('parent_restaurant_id')
    .optional()
    .isString()
    .withMessage('Parent restaurant ID must be a valid String/ID'),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        message: 'Validation errors',
        errors: errors.array().map((error) => ({
          field: error.path,
          message: error.msg,
          value: error.value,
        })),
      });
    }
    next();
  },
];

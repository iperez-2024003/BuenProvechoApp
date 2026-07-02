'use strict';

import { body, validationResult } from 'express-validator';

export const validateEventCreation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Event name is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Event name must be between 3 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),

  body('restaurant_id')
    .notEmpty()
    .withMessage('Restaurant ID is required')
    .isString()
    .withMessage('Restaurant ID must be a valid String/ID'),

  body('event_type')
    .optional()
    .isIn(['tasting', 'cooking_class', 'wine_pairing', 'theme_dinner', 'festival', 'promotion', 'live_music', 'other'])
    .withMessage('Invalid event type'),

  body('event_date')
    .notEmpty()
    .withMessage('Event date is required')
    .custom((value) => {
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) {
        throw new Error('Must be a valid date (YYYY-MM-DD)');
      }
      return true;
    }),

  body('start_time')
    .notEmpty()
    .withMessage('Start time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/)
    .withMessage('Start time must be in HH:MM or HH:MM:SS format'),

  body('end_time')
    .notEmpty()
    .withMessage('End time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/)
    .withMessage('End time must be in HH:MM or HH:MM:SS format'),

  body('max_participants')
    .notEmpty()
    .withMessage('Max participants is required')
    .isInt({ min: 1 })
    .withMessage('Max participants must be at least 1'),

  body('price_per_person')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('image_url')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      if (value.startsWith('data:image/')) return true;
      return /^https?:\/\//i.test(value);
    })
    .withMessage('Banner image must be a valid URL or uploaded image'),

  body('requirements')
    .optional()
    .isArray()
    .withMessage('Requirements must be an array'),

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

export const validateEventUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Event name must be between 3 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),

  body('event_type')
    .optional()
    .isIn(['tasting', 'cooking_class', 'wine_pairing', 'theme_dinner', 'festival', 'promotion', 'live_music', 'other'])
    .withMessage('Invalid event type'),

  body('event_date')
    .optional()
    .isDate()
    .withMessage('Must be a valid date (YYYY-MM-DD)'),

  body('start_time')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('Start time must be in HH:MM:SS format'),

  body('end_time')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('End time must be in HH:MM:SS format'),

  body('max_participants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max participants must be at least 1'),

  body('price_per_person')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('image_url')
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true;
      if (value.startsWith('data:image/')) return true;
      return /^https?:\/\//i.test(value);
    })
    .withMessage('Banner image must be a valid URL or uploaded image'),

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

export const validateParticipantRegistration = [
  body('user_id')
    .optional()
    .isString()
    .withMessage('User ID must be a valid String/ID'),

  body('participant_name')
    .trim()
    .notEmpty()
    .withMessage('Participant name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Participant name must be between 2 and 150 characters'),

  body('participant_email')
    .trim()
    .notEmpty()
    .withMessage('Participant email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('participant_phone')
    .trim()
    .notEmpty()
    .withMessage('Participant phone is required')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid phone number format'),

  body('special_notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special notes cannot exceed 500 characters'),

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

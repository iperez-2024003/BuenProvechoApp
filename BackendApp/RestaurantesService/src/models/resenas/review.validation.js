'use strict';

import { body, validationResult } from 'express-validator';

/**
 * Validation for creating a review
 */
export const validateReviewCreation = [
    body('restaurant_id')
        .notEmpty()
        .withMessage('Restaurant ID is required.')
        .isString()
        .withMessage('Restaurant ID must be a valid ID.'),

    body('rating')
        .notEmpty()
        .withMessage('Rating is required.')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be an integer between 1 and 5.'),

    body('comment')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Comment cannot exceed 1000 characters.'),

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
 * Validation for updating a review
 */
export const validateReviewUpdate = [
    body('rating')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be an integer between 1 and 5.'),

    body('comment')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Comment cannot exceed 1000 characters.'),

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

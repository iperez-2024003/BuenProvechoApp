'use strict';

import { Router } from 'express';
import {
    createReview,
    getRestaurantReviews,
    updateReview,
    deleteReview,
} from './review.controller.js';
import { validateJWT } from '../../../middlewares/validate-JWT.js';
import { requireClient } from '../../../middlewares/require-role.js';
import { validateUuidParam } from '../../../middlewares/validate-params.js';
import {
    validateReviewCreation,
    validateReviewUpdate,
} from './review.validation.js';

const router = Router();

/**
 * Public Routes
 */
// Obtiene todas las reseñas de un restaurante
router.get('/restaurant/:restaurantId', validateUuidParam('restaurantId'), getRestaurantReviews);

/**
 * Protected Routes
 */

// Crear reseña (solo clientes)
router.post('/', [validateJWT, requireClient, validateReviewCreation], createReview);

// Actualizar reseña (solo el cliente que la creó)
router.put('/:id', [validateJWT, validateUuidParam('id'), validateReviewUpdate], updateReview);

// Eliminar reseña (valida interna si es el creador o un superadmin)
router.delete('/:id', [validateJWT, validateUuidParam('id')], deleteReview);

export default router;

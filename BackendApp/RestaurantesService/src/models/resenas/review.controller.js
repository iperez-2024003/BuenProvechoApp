 'use strict';

import * as reviewService from './review.service.js';
import Review from './review.model.js';
import Restaurant from '../restaurantes/restaurant.model.js';
import { SUPER_ADMIN_ROLE } from '../../../helpers/role-constants.js';
import { getRequestUserRoleNames } from '../../../middlewares/require-role.js';

/**
 * Creates a new review
 */
export const createReview = async (req, res) => {
    try {
        const { restaurant_id, rating, comment } = req.body;
        const user_id = req.userId;

        const restaurant = await Restaurant.findById(restaurant_id);
        if (!restaurant) return res.status(404).json({ ok: false, message: 'Restaurante no encontrado' });

        const created = await reviewService.createReviewRecord({ restaurantId: restaurant_id, userId: user_id, rating, comment });
        return res.status(201).json({ ok: true, message: 'Creado exitosamente', review: created });
    } catch (error) {
        console.error('Error creating review:', error);
        return res.status(500).json({
            ok: false,
            message: 'Error creating review',
            error: error.message,
        });
    }
};

/**
 * Let's get all reviews for a specific restaurant
 */
export const getRestaurantReviews = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { limit = 10, offset = 0 } = req.query;
        const reviews = await reviewService.fetchRestaurantReviews(restaurantId, { limit, offset });
        return res.status(200).json({ ok: true, total: reviews.total, reviews: reviews.rows });
    } catch (error) {
        console.error('Error getting reviews:', error);
        return res.status(500).json({
            ok: false,
            message: 'Error getting reviews',
            error: error.message,
        });
    }
};

/**
 * Updates a review
 */
export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const user_id = req.userId;
        const existing = await Review.findById(id);
        if (!existing) return res.status(404).json({ ok: false, message: 'No encontrado' });
        if (existing.userId !== user_id) return res.status(403).json({ ok: false, message: 'You can only edit your own reviews' });
        const updated = await reviewService.updateReviewRecord(id, { rating, comment });
        return res.status(200).json({ ok: true, message: 'Actualizado exitosamente', review: updated });
    } catch (error) {
        console.error('Error updating review:', error);
        return res.status(500).json({
            ok: false,
            message: 'Error updating review',
            error: error.message,
        });
    }
};

/**
 * Deletes a review
 */
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.userId;
        const existing = await Review.findById(id);
        if (!existing) return res.status(404).json({ ok: false, message: 'No encontrado' });
        const roles = await getRequestUserRoleNames(req);
        const isSuperAdmin = roles.includes(SUPER_ADMIN_ROLE);
        if (existing.userId !== user_id && !isSuperAdmin) return res.status(403).json({ ok: false, message: 'You do not have permission to delete this review' });
        await reviewService.deleteReviewRecord(id);
        return res.status(200).json({ ok: true, message: 'Eliminado exitosamente' });
    } catch (error) {
        console.error('Error deleting review:', error);
        return res.status(500).json({
            ok: false,
            message: 'Error deleting review',
            error: error.message,
        });
    }
};

/**
 * Helper: Updates restaurant overall rating
 */
// rating update moved to review.service

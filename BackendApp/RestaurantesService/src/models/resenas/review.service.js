'use strict';

import Review from './review.model.js';
import Restaurant from '../restaurantes/restaurant.model.js';

const serializeReview = (doc) => {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    restaurant_id: doc.restaurantId,
    user_id: doc.userId,
    rating: doc.rating,
    comment: doc.comment,
    created_at: doc.createdAt,
    updated_at: doc.updatedAt,
  };
};

export const createReviewRecord = async (payload) => {
  const review = await Review.create({
    restaurantId: payload.restaurantId,
    userId: payload.userId,
    rating: payload.rating,
    comment: payload.comment,
  });
  await updateRestaurantRating(payload.restaurantId);
  return serializeReview(review.toObject());
};

export const fetchRestaurantReviews = async (restaurantId, options = {}) => {
  const { limit = 10, offset = 0 } = options;
  const total = await Review.countDocuments({ restaurantId });
  const rows = await Review.find({ restaurantId }).sort({ createdAt: -1 }).skip(parseInt(offset, 10)).limit(parseInt(limit, 10)).lean();
  return { total, rows: rows.map(serializeReview) };
};

export const updateReviewRecord = async (id, updateData) => {
  const review = await Review.findById(id);
  if (!review) return null;
  if (updateData.rating !== undefined) review.rating = updateData.rating;
  if (updateData.comment !== undefined) review.comment = updateData.comment;
  await review.save();
  await updateRestaurantRating(review.restaurantId);
  return serializeReview(review.toObject());
};

export const deleteReviewRecord = async (id) => {
  const review = await Review.findById(id);
  if (!review) return null;
  const restaurantId = review.restaurantId;
  await review.remove();
  await updateRestaurantRating(restaurantId);
  return true;
};

export const updateRestaurantRating = async (restaurantId) => {
  const stats = await Review.aggregate([
    { $match: { restaurantId } },
    { $group: { _id: '$restaurantId', averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
  ]);

  const agg = stats[0] || { averageRating: 0, totalReviews: 0 };
  const newRating = agg.averageRating ? parseFloat(agg.averageRating.toFixed(2)) : 0;
  const newTotal = agg.totalReviews || 0;

  await Restaurant.findByIdAndUpdate(restaurantId, { rating: newRating, totalReviews: newTotal });
};

export default {
  createReviewRecord,
  fetchRestaurantReviews,
  updateReviewRecord,
  deleteReviewRecord,
  updateRestaurantRating,
};

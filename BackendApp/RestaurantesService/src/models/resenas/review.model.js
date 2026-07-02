'use strict';

import { Schema, model } from 'mongoose';

const reviewSchema = new Schema(
  {
    restaurantId: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxLength: 1000 },
  },
  { timestamps: true, versionKey: false }
);

reviewSchema.index({ restaurantId: 1 });

export const Review = model('Review', reviewSchema);
export default Review;

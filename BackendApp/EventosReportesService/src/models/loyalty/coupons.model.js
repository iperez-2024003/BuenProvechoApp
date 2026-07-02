'use strict';

import { Schema, model } from 'mongoose';

const couponSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    code: { type: String, required: true, unique: true },
    prize_name: { type: String, required: true },
    expiration_date: { type: Date },
    used: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['active', 'redeemed', 'expired'],
      default: 'active',
    },
  },
  { timestamps: true, versionKey: false }
);

couponSchema.index({ userId: 1, status: 1 });

export const Coupon = model('Coupon', couponSchema);
export default Coupon;

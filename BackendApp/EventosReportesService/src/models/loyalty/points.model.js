'use strict';

import { Schema, model } from 'mongoose';

const pointTransactionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ['earned', 'redeemed', 'expired'],
      default: 'earned',
    },
    description: { type: String, trim: true },
  },
  { timestamps: true, versionKey: false }
);

pointTransactionSchema.index({ userId: 1, createdAt: -1 });

export const PointTransaction = model('PointTransaction', pointTransactionSchema);
export default PointTransaction;

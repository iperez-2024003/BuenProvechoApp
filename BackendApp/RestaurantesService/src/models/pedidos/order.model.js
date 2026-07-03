'use strict';

import { Schema, model } from 'mongoose';

const orderSchema = new Schema(
  {
    order_number: {
      type: String,
      required: [true, 'Unique order number is required'],
      unique: true,
      index: true,
    },
    restaurant_id: {
      type: String,
      required: [true, 'Restaurant ID is required'],
      index: true,
    },
    user_id: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    customer_name: String,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled'],
      default: 'pending',
      index: true,
    },
    order_type: {
      type: String,
      enum: ['dine_in', 'takeout', 'delivery'],
      default: 'dine_in',
    },
    subtotal: { type: Number, default: 0, min: [0, 'Subtotal cannot be negative'] },
    tax: { type: Number, default: 0, min: [0, 'Tax cannot be negative'] },
    discount: { type: Number, default: 0, min: [0, 'Discount cannot be negative'] },
    tip: { type: Number, default: 0, min: [0, 'Tip cannot be negative'] },
    total: { type: Number, default: 0, min: [0, 'Total cannot be negative'] },
    payment_method: {
      type: String,
      enum: ['cash', 'card', 'transfer', 'pending'],
      default: 'pending',
    },
    payment_status: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    notes: String,
    delivery_address: String,
    delivery_fee: { type: Number, default: 0, min: [0, 'Delivery fee cannot be negative'] },
    completed_at: Date,
  },
  {
    collection: 'order',
    timestamps: true,
    versionKey: false,
  }
);

orderSchema.index({ restaurant_id: 1, createdAt: -1 });

export const Order = model('Order', orderSchema);
export default Order;
'use strict';

import { Schema, model } from 'mongoose';

const orderItemSchema = new Schema(
  {
    order_id: {
      type: String,
      required: [true, 'Order ID is required'],
    },
    menu_item_id: {
      type: String,
      required: [true, 'Menu Item ID is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    unit_price: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative'],
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
    },
    special_instructions: String,
    status: {
      type: String,
      enum: ['pending', 'preparing', 'ready', 'served'],
      default: 'pending',
    },
  },
  {
    collection: 'order_item',
    timestamps: true,
    versionKey: false,
  }
);

orderItemSchema.index({ order_id: 1 });
orderItemSchema.index({ menu_item_id: 1 });

export const OrderItem = model('OrderItem', orderItemSchema);
export default OrderItem;
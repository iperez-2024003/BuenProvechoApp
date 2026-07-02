'use strict';

import { Schema, model } from 'mongoose';

const menuSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Menu category name cannot be empty'],
      trim: true,
      minlength: [2, 'Menu category name must be between 2 and 100 characters'],
      maxlength: [100, 'Menu category name must be between 2 and 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      trim: true,
    },
    restaurant_id: {
      type: String,
      required: [true, 'Restaurant ID is required'],
      index: true,
    },
    display_order: {
      type: Number,
      default: 0,
      min: [0, 'Display order cannot be negative'],
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: 'menu',
    timestamps: true,
    versionKey: false,
  }
);

menuSchema.index({ restaurant_id: 1, is_active: 1 });
menuSchema.index({ display_order: 1, name: 1 });

export const Menu = model('Menu', menuSchema);
export default Menu;

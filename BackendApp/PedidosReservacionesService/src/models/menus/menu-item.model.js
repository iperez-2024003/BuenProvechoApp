'use strict';

import { Schema, model } from 'mongoose';

const menuItemSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Menu item name cannot be empty'],
      trim: true,
      minlength: [2, 'Menu item name must be between 2 and 150 characters'],
      maxlength: [150, 'Menu item name must be between 2 and 150 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be greater than or equal to 0'],
    },
    menu_id: {
      type: String,
      required: [true, 'Menu category ID is required'],
      index: true,
    },
    restaurant_id: {
      type: String,
      required: [true, 'Restaurant ID is required'],
      index: true,
    },
    image_url: String,
    ingredients: {
      type: [String],
      default: [],
    },
    allergens: {
      type: [String],
      default: [],
    },
    is_available: {
      type: Boolean,
      default: true,
    },
    stock_quantity: {
      type: Number,
      default: 0,
      min: [0, 'Stock quantity cannot be negative'],
    },
    preparation_time: {
      type: Number,
      min: [1, 'Preparation time must be at least 1 minute'],
      max: [180, 'Preparation time cannot exceed 180 minutes'],
    },
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative'],
    },
    is_vegetarian: {
      type: Boolean,
      default: false,
    },
    is_vegan: {
      type: Boolean,
      default: false,
    },
    is_gluten_free: {
      type: Boolean,
      default: false,
    },
    spice_level: {
      type: String,
      enum: ['none', 'mild', 'medium', 'hot', 'extra_hot'],
      default: 'none',
    },
    portion_size: String,
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: 'menu_item',
    timestamps: true,
    versionKey: false,
  }
);

menuItemSchema.index({ menu_id: 1, is_active: 1 });
menuItemSchema.index({ restaurant_id: 1, is_active: 1 });
menuItemSchema.index({ is_available: 1 });

export const MenuItem = model('MenuItem', menuItemSchema);
export default MenuItem;
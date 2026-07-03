'use strict';

import { Schema, model } from 'mongoose';

const tableSchema = new Schema(
  {
    table_number: {
      type: Number,
      required: [true, 'Table number must be at least 1'],
      min: [1, 'Table number must be at least 1'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [20, 'Capacity cannot exceed 20'],
    },
    location: {
      type: String,
      enum: ['interior', 'terrace', 'vip', 'bar', 'window', 'private'],
      default: 'interior',
    },
    floor: {
      type: Number,
      default: 1,
      min: [1, 'Floor must be at least 1'],
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'cleaning'],
      default: 'available',
    },
    restaurant_id: {
      type: String,
      required: [true, 'Restaurant ID is required'],
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: 'table',
    timestamps: true,
    versionKey: false,
  }
);

tableSchema.index({ restaurant_id: 1 });
tableSchema.index({ status: 1 });
tableSchema.index({ table_number: 1, restaurant_id: 1 }, { unique: true });

export const Table = model('Table', tableSchema);
export default Table;
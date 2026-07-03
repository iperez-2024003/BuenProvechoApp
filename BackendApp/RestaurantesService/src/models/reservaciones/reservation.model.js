'use strict';

import { Schema, model } from 'mongoose';

const reservationSchema = new Schema(
  {
    reservation_number: {
      type: String,
      required: [true, 'Unique reservation number is required'],
      unique: true,
    },
    restaurant_id: {
      type: String,
      required: [true, 'Restaurant ID is required'],
    },
    user_id: {
      type: String,
      default: null,
      index: true,
    },
    customer_name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      minlength: [2, 'Customer name must be between 2 and 150 characters'],
      maxlength: [150, 'Customer name must be between 2 and 150 characters'],
    },
    customer_phone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true,
    },
    customer_email: {
      type: String,
      trim: true,
    },
    reservation_date: {
      type: String,
      required: [true, 'Reservation date is required'],
    },
    reservation_time: {
      type: String,
      required: [true, 'Reservation time is required'],
    },
    party_size: {
      type: Number,
      required: [true, 'Party size is required'],
      min: [1, 'Party size must be at least 1'],
      max: [20, 'Party size cannot exceed 20'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'],
      default: 'pending',
      index: true,
    },
    special_requests: {
      type: String,
      maxlength: [1000, 'Special requests cannot exceed 1000 characters'],
    },
    table_preference: String,
    occasion: String,
    confirmation_sent: {
      type: Boolean,
      default: false,
    },
    reminder_sent: {
      type: Boolean,
      default: false,
    },
    notes: String,
    confirmed_at: Date,
    cancelled_at: Date,
  },
  {
    collection: 'reservation',
    timestamps: true,
    versionKey: false,
  }
);

reservationSchema.index({ restaurant_id: 1, reservation_date: 1 });
reservationSchema.index({ reservation_date: 1, reservation_time: 1 });

export const Reservation = model('Reservation', reservationSchema);
export default Reservation;
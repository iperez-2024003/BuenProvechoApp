'use strict';

import { Schema, model } from 'mongoose';

const eventSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxLength: 200 },
    description: { type: String, trim: true },
    restaurantId: { type: String, required: true },
    eventType: {
      type: String,
      enum: ['tasting', 'cooking_class', 'wine_pairing', 'theme_dinner', 'festival', 'promotion', 'live_music', 'other'],
      default: 'other',
    },
    eventDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    maxParticipants: { type: Number, required: true, min: 1 },
    currentParticipants: { type: Number, default: 0 },
    pricePerPerson: { type: Number, default: 0, min: 0 },
    imageUrl: { type: String },
    requirements: { type: Array, default: [] },
    status: { type: String, enum: ['scheduled', 'ongoing', 'completed', 'cancelled'], default: 'scheduled' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

eventSchema.index({ eventDate: 1 });
eventSchema.index({ status: 1 });

export const Event = model('Event', eventSchema);
export default Event;

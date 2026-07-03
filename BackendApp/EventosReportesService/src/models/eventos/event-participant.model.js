'use strict';

import { Schema, model } from 'mongoose';

const participantSchema = new Schema(
  {
    eventId: { type: String, required: true, index: true },
    userId: { type: String, default: null },
    participantName: { type: String, required: true },
    participantEmail: { type: String, required: true },
    participantPhone: { type: String },
    registrationDate: { type: Date, default: Date.now },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    attendanceStatus: { type: String, enum: ['registered', 'attended', 'absent'], default: 'registered' },
    specialNotes: { type: String },
  },
  { timestamps: true, versionKey: false }
);

export const EventParticipant = model('EventParticipant', participantSchema);
export default EventParticipant;

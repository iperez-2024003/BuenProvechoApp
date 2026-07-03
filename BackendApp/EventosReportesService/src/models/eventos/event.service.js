'use strict';
import Event from './event.model.js';
import EventParticipant from './event-participant.model.js';
import { User } from '../../helpers/auth-user.helper.js';
import Restaurant from '../restaurantes/restaurant.model.js';

export const createEventRecord = async (data) => {
  const event = await Event.create(data);
  return event;
};

export const fetchEvents = async (filters = {}, options = {}) => {
  const { page = 1, limit = 20 } = options;
  const query = { isActive: true };
  if (filters.restaurantId) query.restaurantId = filters.restaurantId;
  if (filters.eventType) query.eventType = filters.eventType;
  if (filters.status) query.status = filters.status;
  else if (!filters.upcoming) query.status = { $ne: 'cancelled' };
  if (filters.upcoming === 'true') {
    query.eventDate = { $gte: new Date(new Date().toISOString().slice(0, 10)) };
    query.status = 'scheduled';
  }

  const total = await Event.countDocuments(query);
  const events = await Event.find(query)
    .sort({ eventDate: 1, startTime: 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10))
    .lean();

  return { total, events };
};

export const fetchEventById = async (id) => {
  const event = await Event.findOne({ _id: id, isActive: true }).lean();
  if (!event) return null;
  const participants = await EventParticipant.find({ eventId: id }).lean();
  const restaurant = await Restaurant.findById(event.restaurantId).select('id name address phone email').lean();
  return { ...event, participants, restaurant };
};

export const updateEventRecord = async (id, updateData) => {
  const event = await Event.findOne({ _id: id, isActive: true });
  if (!event) return null;
  if (['completed', 'cancelled'].includes(event.status)) return { error: `Cannot update event with status: ${event.status}` };
  Object.assign(event, updateData);
  await event.save();
  return event;
};

export const cancelEventRecord = async (id) => {
  const event = await Event.findOne({ _id: id, isActive: true });
  if (!event) return null;
  if (event.status === 'cancelled') return { already: true };
  if (event.status === 'completed') return { notAllowed: true };

  event.status = 'cancelled';
  await event.save();
  return event;
};

export const deleteEventRecord = async (id) => {
  const event = await Event.findOne({ _id: id, isActive: true });
  if (!event) return null;

  await EventParticipant.deleteMany({ eventId: id });
  await Event.deleteOne({ _id: id });
  return { deleted: true };
};

export const registerParticipantRecord = async (eventId, participantData) => {
  const event = await Event.findOne({ _id: eventId, isActive: true });
  if (!event) return { notFound: true };
  if (event.status !== 'scheduled') return { badStatus: true };
  if (event.currentParticipants >= event.maxParticipants) return { full: true };

  const existing = await EventParticipant.findOne({ eventId, participantEmail: participantData.participantEmail });
  if (existing) return { duplicate: true };

  if (participantData.userId) {
    const user = await User.findByPk(participantData.userId);
    if (!user) return { userNotFound: true };
  }

  const participant = await EventParticipant.create({
    eventId,
    userId: participantData.userId || null,
    participantName: participantData.participantName,
    participantEmail: participantData.participantEmail,
    participantPhone: participantData.participantPhone,
    specialNotes: participantData.specialNotes,
    paymentStatus: 'pending',
    attendanceStatus: 'registered',
  });

  const updatedEvent = await Event.findByIdAndUpdate(
    eventId,
    { $inc: { currentParticipants: 1 } },
    { new: true }
  );

  return { participant, event: updatedEvent };
};

export const unregisterParticipantRecord = async (eventId, participantEmail) => {
  const participant = await EventParticipant.findOneAndDelete({ eventId, participantEmail });
  if (!participant) return { notFound: true };
  await Event.findByIdAndUpdate(eventId, { $inc: { currentParticipants: -1 } });
  return { ok: true };
};

export const fetchEventParticipants = async (eventId) => {
  const participants = await EventParticipant.find({ eventId }).sort({ registrationDate: 1 }).lean();
  return participants;
};

export const updateParticipantStatusRecord = async (participantId, paymentStatus) => {
  const participant = await EventParticipant.findByIdAndUpdate(
    participantId,
    { paymentStatus },
    { new: true }
  );
  return participant;
};

export default {
  createEventRecord,
  fetchEvents,
  fetchEventById,
  updateEventRecord,
  cancelEventRecord,
  deleteEventRecord,
  registerParticipantRecord,
  unregisterParticipantRecord,
  fetchEventParticipants,
  updateParticipantStatusRecord,
};

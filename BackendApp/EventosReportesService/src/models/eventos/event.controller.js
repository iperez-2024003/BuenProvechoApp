'use strict';

import * as eventService from './event.service.js';


/**
 * Create event
 * @route POST /api/v1/events
 */
export const createEvent = async (req, res) => {
  try {
    const normalizeTime = (timeValue) => {
      if (!timeValue) return timeValue;
      return timeValue.length === 5 ? `${timeValue}:00` : timeValue;
    };

    const payload = {
      name: req.body.name,
      description: req.body.description,
      restaurantId: req.body.restaurant_id,
      eventType: req.body.event_type || 'other',
      eventDate: new Date(req.body.event_date),
      startTime: normalizeTime(req.body.start_time),
      endTime: normalizeTime(req.body.end_time),
      maxParticipants: Number(req.body.max_participants),
      currentParticipants: 0,
      pricePerPerson: Number(req.body.price_per_person || 0),
      imageUrl: req.body.image_url,
      requirements: req.body.requirements || [],
      status: 'scheduled',
    };

    const event = await eventService.createEventRecord(payload);
    return res.status(201).json({ ok: true, message: 'Creado exitosamente', event });
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor while creating event', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

/**
 * Get all events
 * @route GET /api/v1/events
 */
export const getAllEvents = async (req, res) => {
  try {
    const { restaurant_id, event_type, status, upcoming, page = 1, limit = 20 } = req.query;
    const { total, events } = await eventService.fetchEvents({ restaurantId: restaurant_id, eventType: event_type, status, upcoming }, { page, limit });
    return res.status(200).json({ ok: true, message: 'Datos obtenidos exitosamente', pagination: { total, page: parseInt(page), limit: parseInt(limit), total_pages: Math.ceil(total / parseInt(limit)) }, events });
  } catch (error) {
    console.error('Error getting events:', error);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor while retrieving events', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

/**
 * Get event by ID
 * @route GET /api/v1/events/:id
 */
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await eventService.fetchEventById(id);
    if (!event) return res.status(404).json({ ok: false, message: 'No encontrado' });
    return res.status(200).json({ ok: true, message: 'Datos obtenidos exitosamente', event });
  } catch (error) {
    console.error('Error getting event:', error);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor while retrieving event', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

/**
 * Update event
 * @route PUT /api/v1/events/:id
 */
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const normalizeTime = (timeValue) => {
      if (!timeValue) return timeValue;
      return timeValue.length === 5 ? `${timeValue}:00` : timeValue;
    };

    const updateData = {};
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.start_time !== undefined) updateData.startTime = normalizeTime(req.body.start_time);
    if (req.body.end_time !== undefined) updateData.endTime = normalizeTime(req.body.end_time);
    if (req.body.max_participants !== undefined) updateData.maxParticipants = Number(req.body.max_participants);
    if (req.body.event_date !== undefined) updateData.eventDate = new Date(req.body.event_date);
    if (req.body.price_per_person !== undefined) updateData.pricePerPerson = Number(req.body.price_per_person);

    const result = await eventService.updateEventRecord(id, updateData);
    if (!result) return res.status(404).json({ ok: false, message: 'No encontrado' });
    if (result.error) return res.status(400).json({ ok: false, message: result.error });
    return res.status(200).json({ ok: true, message: 'Actualizado exitosamente', event: result });
  } catch (error) {
    console.error('Error updating event:', error);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor while updating event', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

/**
 * Cancel event
 * @route DELETE /api/v1/events/:id
 */
export const cancelEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await eventService.cancelEventRecord(id);
    if (!result) return res.status(404).json({ ok: false, message: 'No encontrado' });
    if (result.already) return res.status(400).json({ ok: false, message: 'El evento ya estaba cancelado' });
    if (result.notAllowed) return res.status(400).json({ ok: false, message: 'No se puede cancelar un evento completado' });
    return res.status(200).json({ ok: true, message: 'Event cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling event:', error);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor while cancelling event', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

/**
 * Delete event permanently
 * @route DELETE /api/v1/events/:id
 */
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await eventService.deleteEventRecord(id);
    if (!result) return res.status(404).json({ ok: false, message: 'No encontrado' });
    return res.status(200).json({ ok: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor while deleting event', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

/**
 * Register participant in event
 * @route POST /api/v1/events/:id/register
 */
export const registerParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = {
      userId: req.body.user_id,
      participantName: req.body.participant_name,
      participantEmail: req.body.participant_email,
      participantPhone: req.body.participant_phone,
      specialNotes: req.body.special_notes,
    };

    const result = await eventService.registerParticipantRecord(id, payload);
    if (result.notFound) return res.status(404).json({ ok: false, message: 'No encontrado' });
    if (result.badStatus) return res.status(400).json({ ok: false, message: 'Cannot register for this event' });
    if (result.full) return res.status(400).json({ ok: false, message: 'Event is full, no spots available' });
    if (result.duplicate) return res.status(409).json({ ok: false, message: 'This email is already registered for this event' });
    if (result.userNotFound) return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });

    return res.status(201).json({ ok: true, message: 'Registered successfully for event', participant: { id: result.participant._id, participant_name: result.participant.participantName, participant_email: result.participant.participantEmail, payment_status: result.participant.paymentStatus }, event: { id: result.event._id, name: result.event.name, current_participants: result.event.currentParticipants, max_participants: result.event.maxParticipants } });
  } catch (error) {
    console.error('Error registering participant:', error);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor while registering participant', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

/**
 * Unregister from event
 * @route DELETE /api/v1/events/:id/unregister
 */
export const unregisterParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const { participant_email } = req.body;
    const result = await eventService.unregisterParticipantRecord(id, participant_email);
    if (result.notFound) return res.status(404).json({ ok: false, message: 'No encontrado' });
    return res.status(200).json({ ok: true, message: 'Unregistered successfully from event' });
  } catch (error) {
    console.error('Error unregistering participant:', error);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor while unregistering', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

/**
 * Get event participants
 * @route GET /api/v1/events/:id/participants
 */
export const getEventParticipants = async (req, res) => {
  try {
    const { id } = req.params;
    const participants = await eventService.fetchEventParticipants(id);
    return res.status(200).json({ ok: true, message: 'Datos obtenidos exitosamente', count: participants.length, participants });
  } catch (error) {
    console.error('Error getting participants:', error);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor while retrieving participants', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const updateParticipantStatus = async (req, res) => {
  try {
    const { participantId } = req.params;
    const { payment_status } = req.body;
    const participant = await eventService.updateParticipantStatusRecord(participantId, payment_status);
    if (!participant) return res.status(404).json({ ok: false, message: 'Participante no encontrado' });
    return res.status(200).json({ ok: true, message: 'Estado actualizado exitosamente', participant });
  } catch (error) {
    console.error('Error updating participant status:', error);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor while updating participant', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};
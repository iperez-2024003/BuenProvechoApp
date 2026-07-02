'use strict';

import {
  createReservationRecord,
  fetchReservations,
  fetchReservationById,
  updateReservationRecord,
  cancelReservationRecord,
  confirmReservationRecord,
  checkReservationAvailability,
  fetchTodayReservations,
} from './reservation.service.js';

export const createReservation = async (req, res) => {
  try {
    const reservation = await createReservationRecord(req.body);
    return res.status(201).json({ success: true, message: 'Reservación creada exitosamente', data: reservation });
  } catch (error) {
    return res.status(error.message === 'Restaurante no encontrado' ? 404 : 400).json({ success: false, message: error.message });
  }
};

export const getAllReservations = async (req, res) => {
  try {
    const { restaurant_id, user_id, status, reservation_date, page = 1, limit = 20 } = req.query;
    const { reservations, pagination } = await fetchReservations({ restaurant_id, user_id, status, reservation_date, page, limit });
    return res.status(200).json({ success: true, message: 'Datos obtenidos exitosamente', pagination, data: reservations });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const getReservationById = async (req, res) => {
  try {
    const reservation = await fetchReservationById(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, message: 'No encontrado' });
    return res.status(200).json({ success: true, message: 'Datos obtenidos exitosamente', data: reservation });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const updateReservation = async (req, res) => {
  try {
    const reservation = await updateReservationRecord({ id: req.params.id, updateData: req.body });
    return res.status(200).json({ success: true, message: 'Actualizado exitosamente', data: reservation });
  } catch (error) {
    return res.status(error.message === 'No encontrado' ? 404 : 400).json({ success: false, message: error.message });
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const reservation = await cancelReservationRecord(req.params.id);
    return res.status(200).json({ success: true, message: 'Reserva cancelada exitosamente', data: reservation });
  } catch (error) {
    return res.status(error.message === 'No encontrado' ? 404 : 500).json({ success: false, message: error.message });
  }
};

export const confirmReservation = async (req, res) => {
  try {
    const reservation = await confirmReservationRecord(req.params.id);
    return res.status(200).json({ success: true, message: 'Reserva confirmada exitosamente', data: reservation });
  } catch (error) {
    return res.status(error.message === 'No encontrado' ? 404 : 500).json({ success: false, message: error.message });
  }
};

export const checkAvailability = async (req, res) => {
  try {
    const result = await checkReservationAvailability(req.query);
    return res.status(200).json({ success: true, message: 'Disponibilidad verificada', data: result });
  } catch (error) {
    return res.status(error.message === 'Restaurante no encontrado' ? 404 : 400).json({ success: false, message: error.message });
  }
};

export const getTodayReservations = async (req, res) => {
  try {
    const reservations = await fetchTodayReservations();
    return res.status(200).json({ success: true, message: 'Datos obtenidos exitosamente', data: reservations });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};
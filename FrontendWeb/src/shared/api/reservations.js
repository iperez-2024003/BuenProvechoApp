import { pedidosApi as api } from './axios';

export const getReservations = (params = {}) => api.get('/reservations', { params });

export const createReservation = (data) => api.post('/reservations', data);

export const confirmReservation = (id) => api.patch(`/reservations/${id}/confirm`);

export const updateReservation = (id, data) => api.put(`/reservations/${id}`, data);

export const cancelReservation = (id) => api.delete(`/reservations/${id}`);

export const checkReservationAvailability = (params) =>
  api.get('/reservations/check-availability', { params });



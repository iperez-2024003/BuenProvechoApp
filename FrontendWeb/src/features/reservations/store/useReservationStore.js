import { create } from 'zustand';
import {
  getReservations,
  confirmReservation as confirmReservationRequest,
  updateReservation as updateReservationRequest,
  cancelReservation as cancelReservationRequest,
  createReservation as createReservationRequest,
} from '../../../shared/api/reservations';
import { showError, showSuccess } from '../../../shared/utils/toast';

export const useReservationStore = create((set, get) => ({
  reservations: [],
  loading: false,

  fetchReservations: async (params = {}) => {
    set({ loading: true });
    try {
      const response = await getReservations(params);
      set({ reservations: response.data?.data || [], loading: false });
    } catch (error) {
      set({ loading: false });
      showError(error.response?.data?.message || 'Error al obtener reservaciones');
    }
  },

  createReservation: async (payload) => {
    set({ loading: true });
    try {
      const response = await createReservationRequest(payload);
      set({ loading: false });
      showSuccess('Reservación creada con éxito');
      return response.data;
    } catch (error) {
      set({ loading: false });
      showError(error.response?.data?.message || 'No se pudo crear la reservación');
      throw error;
    }
  },

  confirmReservation: async (id) => {
    try {
      await confirmReservationRequest(id);
      const updated = get().reservations.map((r) =>
        r.id === id ? { ...r, status: 'confirmed' } : r
      );
      set({ reservations: updated });
      showSuccess('Reservación confirmada');
    } catch (error) {
      showError(error.response?.data?.message || 'No se pudo confirmar la reservación');
    }
  },

  updateReservationStatus: async (id, status) => {
    try {
      await updateReservationRequest(id, { status });
      const updated = get().reservations.map((r) => (r.id === id ? { ...r, status } : r));
      set({ reservations: updated });
      showSuccess(`Estado actualizado a ${status}`);
    } catch (error) {
      showError(error.response?.data?.message || 'No se pudo actualizar el estado');
    }
  },

  cancelReservation: async (id) => {
    try {
      await cancelReservationRequest(id);
      const updated = get().reservations.map((r) =>
        r.id === id ? { ...r, status: 'cancelled' } : r
      );
      set({ reservations: updated });
      showSuccess('Reservación cancelada');
    } catch (error) {
      showError(error.response?.data?.message || 'No se pudo cancelar la reservación');
    }
  },
}));


import { create } from 'zustand';
import axiosClient, { eventService } from '../../../shared/api/axiosClient';
import API_CONFIG from '../../../shared/api/config';

const useEventsStore = create((set, get) => ({
  events: [],
  loading: false,
  error: null,

  fetchEvents: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = Object.keys(params).length > 0 ? params : undefined;
      const response = await eventService.getAll(queryParams);
      const eventsList = response.data?.data || response.data || [];
      set({ events: Array.isArray(eventsList) ? eventsList : [], loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || error.message || 'Error al cargar eventos',
      });
    }
  },

  fetchAllEvents: async () => {
    set({ loading: true, error: null });
    try {
      const response = await eventService.getAllEvents();
      const raw = response.data?.events || response.data?.data || response.data || [];
      const eventsList = Array.isArray(raw) ? raw : [];
      const normalized = eventsList.map((e) => ({
        _id: e._id || e.id,
        id: e.id || e._id || Math.random().toString(),
        name: e.name || e.titulo || e.nombre || 'Evento Especial',
        description: e.description || e.descripcion || e.desc || '',
        date: e.eventDate || e.date || e.fecha || e.fecha_evento || null,
        image_url: e.imageUrl || e.image_url || e.imagen || e.foto || e.image || '',
        type: e.eventType || e.type || 'promotion',
        eventType: e.eventType || e.type || 'promotion',
        maxParticipants: e.maxParticipants || 100,
        currentParticipants: e.currentParticipants || 0,
        participants: e.participants || [],
        discount: e.discount || e.descuento || e.discount_percent || null,
        status: e.status || 'active',
      }));
      set({ events: normalized, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || error.message || 'Error al cargar eventos',
      });
    }
  },

  participateInEvent: async (eventId, userData = {}) => {
    set({ loading: true, error: null });
    try {
      const baseUrl = `${API_CONFIG.REPORT_URL.replace('/stats', '')}`;
      const participantName = userData.name || userData.username || 'Cliente';
      const response = await axiosClient.post(`${baseUrl}/events/${eventId}/register`, {
        participant_name: participantName,
        participant_email: userData.email || '',
        participant_phone: userData.phone || '00000000',
      });
      await get().fetchEvents();
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ loading: false });
      const status = error?.response?.status;
      const msg = error?.response?.data?.message || '';
      if (status === 401) return { sessionExpired: true, message: 'Tu sesión ha expirado. Inicia sesión de nuevo.' };
      if (status === 409 || status === 400) {
        return {
          alreadyRegistered: status === 409,
          noSpots: status === 400 && /full|capacidad|no spots/i.test(msg),
        };
      }
      if (/already registered|ya (esta|estas) inscrito/i.test(msg)) return { alreadyRegistered: true };
      if (/full|capacidad|no spots/i.test(msg)) return { noSpots: true };
      return { error: msg || 'Error al participar en el evento' };
    }
  },
}));

export default useEventsStore;

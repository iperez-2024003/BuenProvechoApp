import { create } from 'zustand';
import { eventService } from '../../../shared/api/axiosClient';

const useEventsStore = create((set, get) => ({
    events: [],
    loading: false,
    error: null,

    fetchEvents: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const response = await eventService.getAll(params);
            const eventsList = response.data?.data || response.data || [];
            set({ events: Array.isArray(eventsList) ? eventsList : [], loading: false });
        } catch (error) {
            set({
                loading: false,
                error: error.response?.data?.message || error.message || 'Error al cargar eventos',
            });
        }
    },

    participateInEvent: async (eventId, userId) => {
        set({ loading: true, error: null });
        try {
            const response = await eventService.participate(eventId, userId);
            // Re-fetch events to update the participants count or active status
            await get().fetchEvents();
            set({ loading: false });
            return response.data;
        } catch (error) {
            set({ loading: false });
            const errMsg = error.response?.data?.message || error.message || 'Error al participar en el evento';
            throw new Error(errMsg);
        }
    },
}));

export default useEventsStore;
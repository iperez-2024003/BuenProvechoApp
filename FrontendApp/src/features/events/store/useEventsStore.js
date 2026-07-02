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
}));
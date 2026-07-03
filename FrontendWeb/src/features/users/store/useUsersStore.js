import { create } from 'zustand';
import {
  getManagers,
  createManager,
  updateManagerRestaurant,
  deleteManager,
} from '../../../shared/api/auth';
import { getGlobalVipClients } from '../../../shared/api/statistics';

export const useUsersStore = create((set, get) => ({
  managers: [],
  vipClients: [],
  loading: false,
  error: null,

  // ── Obtener gerentes ────────────────────────────────────────────────────────
  fetchManagers: async () => {
    try {
      set({ loading: true, error: null });
      const response = await getManagers();
      set({
        managers: response.data.data || [],
        loading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al obtener gerentes',
        loading: false,
      });
    }
  },

  // ── Crear gerente ───────────────────────────────────────────────────────────
  createManager: async (data) => {
    try {
      set({ loading: true, error: null });
      const response = await createManager(data);
      await get().fetchManagers();
      set({ loading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ loading: false });
      const validationErrors = Array.isArray(error.response?.data?.errors)
        ? error.response.data.errors.map((item) => `${item.field}: ${item.message}`).join(' | ')
        : '';
      return {
        success: false,
        error: validationErrors || error.response?.data?.message || 'Error al crear gerente',
        errors: error.response?.data?.errors || [],
      };
    }
  },

  // ── Actualizar restaurante de gerente ────────────────────────────────────────
  updateManagerRestaurant: async (managerId, restaurantId) => {
    try {
      set({ loading: true, error: null });
      const response = await updateManagerRestaurant(managerId, restaurantId);
      await get().fetchManagers();
      set({ loading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar sede',
      };
    }
  },

  // ── Eliminar gerente ─────────────────────────────────────────────────────────
  deleteManager: async (managerId) => {
    try {
      set({ loading: true, error: null });
      await deleteManager(managerId);
      set((state) => ({
        managers: state.managers.filter((m) => m.id !== managerId),
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar gerente',
      };
    }
  },

  // ── Obtener clientes VIP ─────────────────────────────────────────────────────
  fetchVipClients: async () => {
    try {
      set({ loading: true, error: null });
      const response = await getGlobalVipClients();
      set({
        vipClients: response.data.data || [],
        loading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al obtener clientes VIP',
        loading: false,
      });
    }
  },
}));

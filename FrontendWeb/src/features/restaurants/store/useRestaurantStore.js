import { create } from 'zustand';
import {
  getRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  verifyRestaurant,
} from '../../../shared/api/restaurants';

export const useRestaurantStore = create((set, get) => ({
  restaurants: [],
  loading: false,
  error: null,
  pagination: null,

  // ── Obtener todos los restaurantes ──────────────────────────────────────────
  getRestaurants: async (params = {}) => {
    try {
      set({ loading: true, error: null });

      // Senior Audit: Limpieza total de params. Solo enviar lo que el usuario pida.
      // No inyectamos limit por defecto para evitar discrepancias de contrato (NaN en offset).
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v != null && v !== '')
      );

      const response = await getRestaurants(cleanParams);
      set({
        restaurants: response.data.data || [],
        pagination: response.data.pagination || null,
        loading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error al obtener restaurantes',
        loading: false,
      });
    }
  },

  // ── Crear restaurante ────────────────────────────────────────────────────────
  createRestaurant: async (data) => {
    try {
      set({ loading: true, error: null });
      const response = await createRestaurant(data);
      // Refrescamos la lista completa para tener todos los datos del nuevo item
      await get().getRestaurants();
      set({ loading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ loading: false });
      const validationErrors = Array.isArray(error.response?.data?.errors)
        ? error.response.data.errors.map((item) => `${item.field}: ${item.message}`).join(' | ')
        : '';
      return {
        success: false,
        error: validationErrors || error.response?.data?.message || 'Error al crear restaurante',
        errors: error.response?.data?.errors || [],
      };
    }
  },

  // ── Editar restaurante ───────────────────────────────────────────────────────
  updateRestaurant: async (id, data) => {
    try {
      set({ loading: true, error: null });
      const response = await updateRestaurant(id, data);
      await get().getRestaurants();
      set({ loading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ loading: false });
      const validationErrors = Array.isArray(error.response?.data?.errors)
        ? error.response.data.errors.map((item) => `${item.field}: ${item.message}`).join(' | ')
        : '';
      return {
        success: false,
        error: validationErrors || error.response?.data?.message || 'Error al actualizar restaurante',
      };
    }
  },

  // ── Eliminar restaurante (soft-delete) ───────────────────────────────────────
  deleteRestaurant: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteRestaurant(id);
      // Quitar de la lista local sin refetch
      set((state) => ({
        restaurants: state.restaurants.filter((r) => r.id !== id),
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar restaurante',
      };
    }
  },

  // ── Verificar restaurante ────────────────────────────────────────────────────
  verifyRestaurant: async (id) => {
    try {
      await verifyRestaurant(id);
      // Actualizar localmente el campo is_verified
      set((state) => ({
        restaurants: state.restaurants.map((r) =>
          r.id === id ? { ...r, is_verified: true } : r
        ),
      }));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al verificar restaurante',
      };
    }
  },
}));

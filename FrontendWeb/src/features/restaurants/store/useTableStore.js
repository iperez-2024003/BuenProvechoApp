import { create } from 'zustand';
import * as tableApi from '../../../shared/api/tables';

export const useTableStore = create((set, get) => ({
  tables: [],
  loading: false,
  error: null,

  getTables: async (restaurantId) => {
    try {
      set({ loading: true });
      const response = await tableApi.getTables(restaurantId);
      // El backend devuelve { success: true, data: { tables: [], pagination: {} } }
      const tablesData = response.data.data;
      set({ 
        tables: Array.isArray(tablesData) ? tablesData : (tablesData?.tables || []), 
        loading: false 
      });
    } catch (error) {
      set({ error: 'Error al cargar mesas', loading: false });
    }
  },

  createTable: async (data) => {
    try {
      set({ loading: true });
      await tableApi.createTable(data);
      await get().getTables(data.restaurant_id);
      set({ loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al crear mesa' 
      };
    }
  },

  updateTable: async (id, data) => {
    try {
      set({ loading: true });
      await tableApi.updateTable(id, data);
      await get().getTables(data.restaurant_id);
      set({ loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al actualizar mesa' 
      };
    }
  },

  updateStatus: async (id, status, restaurantId) => {
    try {
      await tableApi.updateTableStatus(id, status);
      // Optimistic update o refresco simple
      set((state) => ({
        tables: state.tables.map(t => t.id === id ? { ...t, status } : t)
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error al cambiar estado' };
    }
  },

  deleteTable: async (id, restaurantId) => {
    try {
      set({ loading: true });
      await tableApi.deleteTable(id);
      set((state) => ({
        tables: state.tables.filter(t => t.id !== id),
        loading: false
      }));
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error: 'Error al eliminar mesa' };
    }
  }
}));

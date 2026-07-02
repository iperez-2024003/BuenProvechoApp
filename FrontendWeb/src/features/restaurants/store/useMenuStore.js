import { create } from 'zustand';
import * as menuApi from '../../../shared/api/menus';

export const useMenuStore = create((set, get) => ({
  menus: [], // Categorías
  items: [], // Platillos
  loading: false,
  error: null,

  // ── Cargar Categorías de un Restaurante ──────────────────────────────────────
  getMenus: async (restaurantId) => {
    try {
      set({ loading: true });
      const response = await menuApi.getMenus(restaurantId);
      // El backend devuelve un objeto con { data: { menus: [], pagination: {} } }
      // O si usamos el controlador estandarizado: { success: true, data: { menus: [], pagination: {} } }
      const menuData = response.data.data;
      set({ 
        menus: Array.isArray(menuData) ? menuData : (menuData?.menus || []), 
        loading: false 
      });
    } catch (error) {
      set({ error: 'Error al cargar categorías', loading: false });
    }
  },

  // ── Cargar Platillos ─────────────────────────────────────────────────────────
  getMenuItems: async (restaurantId, menuId = null) => {
    try {
      set({ loading: true });
      const response = await menuApi.getMenuItems({ 
        restaurant_id: restaurantId,
        ...(menuId && { menu_id: menuId })
      });
      // El backend devuelve un objeto con { data: { items: [], pagination: {} } }
      const itemData = response.data.data;
      set({ 
        items: Array.isArray(itemData) ? itemData : (itemData?.items || []), 
        loading: false 
      });
    } catch (error) {
      set({ error: 'Error al cargar platillos', loading: false });
    }
  },

  // ── Crear Platillo ───────────────────────────────────────────────────────────
  createMenuItem: async (formData) => {
    try {
      set({ loading: true });
      const response = await menuApi.createMenuItem(formData);
      const restaurantId = formData.get('restaurant_id');
      await get().getMenuItems(restaurantId);
      set({ loading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ loading: false });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al crear platillo' 
      };
    }
  },

  // ── Actualizar Platillo ──────────────────────────────────────────────────────
  updateMenuItem: async (id, formData) => {
    try {
      set({ loading: true });
      const response = await menuApi.updateMenuItem(id, formData);
      const restaurantId = formData.get('restaurant_id');
      await get().getMenuItems(restaurantId);
      set({ loading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ loading: false });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al actualizar platillo' 
      };
    }
  },

  // ── Eliminar Platillo ────────────────────────────────────────────────────────
  deleteMenuItem: async (id, restaurantId) => {
    try {
      set({ loading: true });
      await menuApi.deleteMenuItem(id);
      set((state) => ({
        items: state.items.filter(item => item.id !== id),
        loading: false
      }));
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error: 'Error al eliminar platillo' };
    }
  },

  // ── Crear Categoría ──────────────────────────────────────────────────────────
  createCategory: async (data) => {
    try {
      set({ loading: true });
      await menuApi.createMenu(data);
      await get().getMenus(data.restaurant_id);
      set({ loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error: 'Error al crear categoría' };
    }
  }
}));

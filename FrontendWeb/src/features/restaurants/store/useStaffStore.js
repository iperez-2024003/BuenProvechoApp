import { create } from 'zustand';
import api from '../../../shared/api/axios';
import { showSuccess, showError } from '../../../shared/utils/toast';

export const useStaffStore = create((set, get) => ({
  staff: [],
  loading: false,

  getStaff: async (restaurantId) => {
    try {
      set({ loading: true });
      const res = await api.get(`/restaurants/${restaurantId}/staff`);
      set({ staff: res.data.staff, loading: false });
    } catch (error) {
      console.error('Error fetching staff:', error);
      set({ loading: false });
    }
  },

  createStaff: async (restaurantId, staffData) => {
    try {
      set({ loading: true });
      await api.post(`/restaurants/${restaurantId}/staff`, staffData);

      showSuccess('Mesero creado correctamente');

      // Actualizar lista local
      await get().getStaff(restaurantId);

      set({ loading: false });
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al crear mesero';
      showError(msg);
      set({ loading: false });
      return false;
    }
  },

  updateRole: async (restaurantId, staffId, newRole) => {
    try {
      set({ loading: true });
      await api.put(`/restaurants/${restaurantId}/staff/${staffId}`, { newRole });
      showSuccess(`Rol actualizado a ${newRole}`);
      await get().getStaff(restaurantId);
      set({ loading: false });
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al actualizar rol';
      showError(msg);
      set({ loading: false });
      return false;
    }
  }
}));

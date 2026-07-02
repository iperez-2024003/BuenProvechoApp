import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, pointsService } from '../../../shared/api/axiosClient';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
  isLoading: false,
  points: 0,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await authService.login({ email, password });
      const { token, userDetails } = response.data;
      const userRole = userDetails?.role || 'CLIENT_ROLE';
      const userPoints = userDetails?.points || 0;

      set({
        token,
        user: userDetails,
        role: userRole,
        points: userPoints,
        isAuthenticated: true,
        isLoading: false,
      });

      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userDetails));
      await AsyncStorage.setItem('vipPoints', String(userPoints));

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        error: error.response?.data?.message || 'Error al iniciar sesión',
        code: error.response?.data?.code,
        originalError: error,
      };
    }
  },

  logout: async () => {
    set({ user: null, token: null, role: null, isAuthenticated: false, points: 0 });
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
    await AsyncStorage.removeItem('vipPoints');
  },

  deleteAccount: async () => {
    set({ isLoading: true });
    try {
      await authService.deleteAccount();
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('vipPoints');
      set({ user: null, token: null, role: null, isAuthenticated: false, isLoading: false, points: 0 });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error al eliminar la cuenta' };
    }
  },

  getProfile: async () => {
    try {
      const response = await authService.getProfile();
      const profile = response.data.data || response.data;
      const serverPoints = profile?.points || 0;
      set({ user: profile, points: serverPoints });
      await AsyncStorage.setItem('userData', JSON.stringify(profile));
      await AsyncStorage.setItem('vipPoints', String(serverPoints));
      return { success: true, data: profile };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error al cargar perfil' };
    }
  },

  updateProfile: async (formData) => {
    set({ isLoading: true });
    try {
      const response = await authService.updateProfile(formData);
      const profile = response.data.data || response.data;
      set({ user: profile, isLoading: false });
      await AsyncStorage.setItem('userData', JSON.stringify(profile));
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error al actualizar perfil' };
    }
  },

  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    set({ isLoading: true });
    try {
      const response = await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error al cambiar contraseña' };
    }
  },

  addPoints: async (amount) => {
    try {
      const response = await authService.addPoints({ amount });
      const newPoints = response.data?.data?.points || 0;
      set({ points: newPoints });
      await AsyncStorage.setItem('vipPoints', String(newPoints));
      return newPoints;
    } catch (error) {
      const currentPoints = get().points || 0;
      return currentPoints;
    }
  },

  redeemPoints: async (amount, prizeName) => {
    try {
      const response = await pointsService.redeem({ cost: amount, prize_name: prizeName });
      const { points: newPoints, coupon } = response.data;
      set({ points: newPoints || 0 });
      await AsyncStorage.setItem('vipPoints', String(newPoints || 0));
      return { success: true, remaining: newPoints || 0, coupon };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al canjear puntos',
      };
    }
  },
}));

// Load credentials on startup
const loadCredentials = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    const userData = await AsyncStorage.getItem('userData');
    if (token && userData) {
      const user = JSON.parse(userData);
      const savedPoints = await AsyncStorage.getItem('vipPoints');
      const points = savedPoints ? parseInt(savedPoints, 10) : 0;
      useAuthStore.setState({
        token,
        user,
        role: user.role || 'CLIENT_ROLE',
        isAuthenticated: true,
        points,
      });
    }
  } catch (error) {
    console.error('Error loading credentials in useAuthStore:', error);
  }
};

loadCredentials();

export default useAuthStore;

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../../../shared/api/axios';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { token, userDetails } = response.data;

          const userRole = userDetails?.role || 'CLIENT_ROLE';

          set({
            token,
            user: userDetails,
            role: userRole,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          const backendMessage = error.response?.data?.message;
          const backendCode = error.response?.data?.code;
          return {
            success: false,
            error: backendMessage || 'Error al iniciar sesión',
            code: backendCode,
          };
        }
      },

      register: async (formData) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', formData);
          set({ isLoading: false });
          return { success: true, message: response.data.message };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || 'Error al registrar usuario',
            details: error.response?.data?.errors || [],
          };
        }
      },

      verifyEmail: async (token) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/verify-email', { token });
          set({ isLoading: false });
          return { success: true, message: response.data.message };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.response?.data?.message || 'Error al verificar email' };
        }
      },

      resendVerification: async (email) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/resend-verification', { email });
          set({ isLoading: false });
          return { success: true, message: response.data.message };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.response?.data?.message || 'Error al reenviar verificación' };
        }
      },

      forgotPassword: async (email) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/forgot-password', { email });
          set({ isLoading: false });
          return { success: true, message: response.data.message };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.response?.data?.message || 'Error al solicitar cambio de contraseña' };
        }
      },

      resetPassword: async (token, newPassword) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/reset-password', { token, newPassword });
          set({ isLoading: false });
          return { success: true, message: response.data.message };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.response?.data?.message || 'Error al cambiar contraseña' };
        }
      },

      getProfile: async () => {
        try {
          const response = await api.get('/auth/profile');
          set({ user: response.data.data });
          return { success: true, data: response.data.data };
        } catch (error) {
          return { success: false, error: error.response?.data?.message || 'Error al cargar perfil' };
        }
      },

      updateProfile: async (formData) => {
        set({ isLoading: true });
        try {
          const response = await api.put('/auth/profile', formData);
          set({ user: response.data.data, isLoading: false });
          return { success: true, message: response.data.message };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.response?.data?.message || 'Error al actualizar perfil' };
        }
      },

      changePassword: async (currentPassword, newPassword, confirmPassword) => {
        set({ isLoading: true });
        try {
          const response = await api.put('/auth/profile/change-password', {
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

      createManager: async (managerData) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/create-manager', managerData);
          set({ isLoading: false });
          return { success: true, message: response.data.message, data: response.data.user };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.response?.data?.message || 'Error al crear gerente' };
        }
      },

      logout: () => {
        set({ user: null, token: null, role: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

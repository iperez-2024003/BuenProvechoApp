import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../../../shared/api/axiosClient';

const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    role: null,
    isAuthenticated: false,
    isLoading: false,

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const response = await authService.login({ email, password });
            const { token, userDetails } = response.data;
            const userRole = userDetails?.role || 'CLIENT_ROLE';

            set({
                token,
                user: userDetails,
                role: userRole,
                isAuthenticated: true,
                isLoading: false,
            });

            await AsyncStorage.setItem('authToken', token);
            await AsyncStorage.setItem('userData', JSON.stringify(userDetails));

            return { success: true };
        } catch (error) {
            set({ isLoading: false });
            return {
                success: false,
                error: error.response?.data?.message || 'Error al iniciar sesión',
            };
        }
    },

    logout: async () => {
        set({ user: null, token: null, role: null, isAuthenticated: false });
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userData');
    },

    getProfile: async () => {
        try {
            const response = await authService.getProfile();
            const profile = response.data.data || response.data;
            set({ user: profile });
            await AsyncStorage.setItem('userData', JSON.stringify(profile));
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
}));

const loadCredentials = async () => {
    try {
        const token = await AsyncStorage.getItem('authToken');
        const userData = await AsyncStorage.getItem('userData');
        if (token && userData) {
            const user = JSON.parse(userData);
            useAuthStore.setState({
                token,
                user,
                role: user.role || 'CLIENT_ROLE',
                isAuthenticated: true,
            });
        }
    } catch (error) {
        console.error('Error loading credentials in useAuthStore:', error);
    }
};

loadCredentials();

export default useAuthStore;
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
    }

}));
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../../../shared/api/axiosClient';

const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    role: null,
    isAuthenticated: false,
    isLoading: false,
    

}));
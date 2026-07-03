// Centralized Axios Client for FrontendApp
// Handles all HTTP requests to microservices

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG from './config';

// Create axios instance with base configuration
const axiosClient = axios.create({
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
  withCredentials: false, // Disabled for mobile, using Authorization header instead
});

// Request interceptor to add auth token if available
axiosClient.interceptors.request.use(
  async (config) => {
    try {
      if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      // Ensure Content-Type is set for POST/PUT/PATCH requests
      if (config.method && ['post', 'put', 'patch'].includes(config.method.toLowerCase())) {
        config.headers['Content-Type'] = 'application/json';
      }
    } catch (error) {
      console.error('Error getting token from AsyncStorage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status !== 409 && status !== 400) {
        console.error('API Error:', status, error.response.data);
      }
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API service methods for each microservice
export const authService = {
  login: (data) => axiosClient.post(`${API_CONFIG.AUTH_URL}/login`, data),
  register: (data) => axiosClient.post(`${API_CONFIG.AUTH_URL}/register`, data),
  forgotPassword: (data) => axiosClient.post(`${API_CONFIG.AUTH_URL}/forgot-password`, data),
  resetPassword: (data) => axiosClient.post(`${API_CONFIG.AUTH_URL}/reset-password`, data),
  verifyEmail: (data) => axiosClient.post(`${API_CONFIG.AUTH_URL}/verify-email`, data),
  resendVerification: (data) => axiosClient.post(`${API_CONFIG.AUTH_URL}/resend-verification`, data),
  getProfile: () => axiosClient.get(`${API_CONFIG.AUTH_URL}/profile`),
  getProfileById: (userId) => axiosClient.post(`${API_CONFIG.AUTH_URL}/profile/by-id`, { userId }),
  updateProfile: (data) => axiosClient.put(`${API_CONFIG.AUTH_URL}/profile`, data),
  changePassword: (data) => axiosClient.put(`${API_CONFIG.AUTH_URL}/profile/change-password`, data),
  deleteAccount: () => axiosClient.delete(`${API_CONFIG.AUTH_URL}/profile`),
  addPoints: (data) => axiosClient.post(`${API_CONFIG.AUTH_URL}/profile/add-points`, data),
};

export const restaurantService = {
  getAll: () => axiosClient.get(`${API_CONFIG.RESTAURANT_URL}`),
  getById: (id) => axiosClient.get(`${API_CONFIG.RESTAURANT_URL}/${id}`),
  getTables: (restaurantId) => axiosClient.get(`${API_CONFIG.RESTAURANT_SERVICE_URL}/tables`, { params: { restaurant_id: restaurantId } }),
  createReview: (data) => axiosClient.post(`${API_CONFIG.RESTAURANT_SERVICE_URL}/reviews`, data),
  getRestaurantReviews: (restaurantId) => axiosClient.get(`${API_CONFIG.RESTAURANT_SERVICE_URL}/reviews/restaurant/${restaurantId}`),
};

export const menuService = {
  getAll: (restaurantId) => axiosClient.get(`${API_CONFIG.RESTAURANT_SERVICE_URL}/menus`, { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
  getById: (id) => axiosClient.get(`${API_CONFIG.RESTAURANT_SERVICE_URL}/menus/${id}`),
  getAllItems: (params = {}) => axiosClient.get(`${API_CONFIG.RESTAURANT_SERVICE_URL}/menus/items/all`, { params }),
  getItemById: (id) => axiosClient.get(`${API_CONFIG.RESTAURANT_SERVICE_URL}/menus/items/${id}`),
};

export const orderService = {
  create: (data) => axiosClient.post(`${API_CONFIG.ORDER_URL}`, data),
  getById: (id) => axiosClient.get(`${API_CONFIG.ORDER_URL}/${id}`),
  getByUser: (userId) => axiosClient.get(`${API_CONFIG.ORDER_URL}`, { params: { user_id: userId } }),
};

export const reservationService = {
  create: (data) => axiosClient.post(`${API_CONFIG.ORDER_SERVICE_URL}/reservations`, data),
  checkAvailability: (params) => axiosClient.get(`${API_CONFIG.ORDER_SERVICE_URL}/reservations/check-availability`, { params }),
  getByUser: (userId) => axiosClient.get(`${API_CONFIG.ORDER_SERVICE_URL}/reservations`, { params: { user_id: userId } }),
};

export const eventService = {
  getAll: (params = {}) => axiosClient.get(`${API_CONFIG.REPORT_URL.replace('/stats', '')}/events`, { params }),
  getAllEvents: () => axiosClient.get(`${API_CONFIG.REPORT_URL.replace('/stats', '')}/events`),
  participate: (eventId, participantData) => axiosClient.post(`${API_CONFIG.REPORT_URL.replace('/stats', '')}/events/${eventId}/register`, participantData),
};

export const reportService = {
  getStats: (restaurantId) => axiosClient.get(`${API_CONFIG.REPORT_URL}/${restaurantId}`),
};

export const pointsService = {
  getHistory: () => axiosClient.get(`${API_CONFIG.LOYALTY_URL}/points/history`),
  redeem: (data) => axiosClient.post(`${API_CONFIG.LOYALTY_URL}/points/redeem`, data),
};

export const couponsService = {
  getActive: () => axiosClient.get(`${API_CONFIG.LOYALTY_URL}/coupons/active`),
  validate: (data) => axiosClient.post(`${API_CONFIG.LOYALTY_URL}/coupons/validate`, data),
};

export default axiosClient;

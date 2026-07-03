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
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error:', error.message);
    } else {
      // Error in request configuration
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);


export default axiosClient;

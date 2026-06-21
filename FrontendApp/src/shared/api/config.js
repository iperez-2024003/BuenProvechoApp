// API Configuration for FrontendApp
// Reads environment variables from .env file with EXPO_PUBLIC_ prefix

const AUTH_URL = process.env.EXPO_PUBLIC_AUTH_URL || 'http://192.168.0.7:3006/api/v1/auth';
const RESTAURANT_URL = process.env.EXPO_PUBLIC_RESTAURANT_URL || 'http://192.168.0.7:3007/api/v1/restaurants';
const ORDER_URL = process.env.EXPO_PUBLIC_ORDER_URL || 'http://192.168.0.7:3008/api/v1/orders';
const REPORT_URL = process.env.EXPO_PUBLIC_REPORT_URL || 'http://192.168.0.7:3009/api/v1/stats';

// Base API configuration
const API_CONFIG = {
  AUTH_URL,
  RESTAURANT_URL,
  ORDER_URL,
  REPORT_URL,
  TIMEOUT: 30000, // 30 seconds timeout for mobile network
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export default API_CONFIG;

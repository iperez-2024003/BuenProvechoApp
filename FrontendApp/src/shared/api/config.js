// API Configuration for FrontendApp
// Reads environment variables from .env file with EXPO_PUBLIC_ prefix

// Use env vars directly - they already include full paths
const AUTH_URL = process.env.EXPO_PUBLIC_AUTH_URL || 'http://192.168.0.7:3006/api/v1/auth';

// Base API configuration
const API_CONFIG = {
  AUTH_URL,
  TIMEOUT: 30000, // 30 seconds timeout for mobile network
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export default API_CONFIG;

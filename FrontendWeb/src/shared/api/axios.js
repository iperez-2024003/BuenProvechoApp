import axios from 'axios';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { translateApiMessage } from '../utils/i18n';

// ─── Microservices API Instances ────────────────────────────────────────────
const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL || 'http://localhost:3006/api/v1',
  withCredentials: true,
});

const restaurantesApi = axios.create({
  baseURL: import.meta.env.VITE_RESTAURANTES_URL || 'http://localhost:3007/api/v1',
  withCredentials: true,
});

const pedidosApi = axios.create({
  baseURL: import.meta.env.VITE_PEDIDOS_URL || 'http://localhost:3008/api/v1',
  withCredentials: true,
});

const eventosApi = axios.create({
  baseURL: import.meta.env.VITE_EVENTOS_URL || 'http://localhost:3009/api/v1',
  withCredentials: true,
});

// ─── Shared Interceptors ────────────────────────────────────────────────────
const setupInterceptors = (instance) => {
  instance.interceptors.request.use((config) => {
    const publicRoutes = ['/auth/login', '/auth/register', '/auth/resend-verification', '/auth/verify-email', '/auth/forgot-password', '/auth/reset-password'];
    const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));

    if (!isPublicRoute) {
      const token = useAuthStore.getState().token || localStorage.getItem('token');
      const isValidToken = token && token !== 'undefined' && token !== 'null';

      if (isValidToken) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    const methodsWithBody = ['post', 'put', 'patch'];
    if (config.data && !(config.data instanceof FormData) && methodsWithBody.includes(config.method?.toLowerCase())) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  let refreshInFlight = null;

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error?.response?.status === 401 && !originalRequest?._retry && !originalRequest?.url?.includes('/auth/refresh')) {
        originalRequest._retry = true;

        try {
          refreshInFlight = refreshInFlight || authApi.post('/auth/refresh', {}, { withCredentials: true });
          const refreshResponse = await refreshInFlight;
          refreshInFlight = null;

          const newToken = refreshResponse?.data?.token;
          if (newToken) {
            useAuthStore.setState({ token: newToken });
            localStorage.setItem('token', newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          refreshInFlight = null;
        }

        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
          useAuthStore.getState().logout?.();
          window.location.href = '/login';
          return Promise.reject(error);
        }
      }

      const backendMessage = error?.response?.data?.message;
      if (backendMessage && error.response?.data) {
        error.response.data.message = translateApiMessage(backendMessage);
      }
      if (Array.isArray(error?.response?.data?.errors)) {
        error.response.data.errors = error.response.data.errors.map((item) => ({
          ...item,
          message: translateApiMessage(item?.message || ''),
        }));
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Apply interceptors to all instances
setupInterceptors(authApi);
setupInterceptors(restaurantesApi);
setupInterceptors(pedidosApi);
setupInterceptors(eventosApi);

// Default export = authApi for backward compatibility (stores that import `api` directly)
const api = authApi;
export default api;

// Named exports for specific services
export { authApi, restaurantesApi, pedidosApi, eventosApi };

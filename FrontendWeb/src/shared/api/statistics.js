import { eventosApi as api } from './axios';

export const getRestaurantOverview = (id) => api.get(`/statistics/restaurant/${id}/overview`);
export const getOrdersStats = (id, period = 'month') => api.get(`/statistics/restaurant/${id}/orders`, { params: { period } });
export const getPopularDishes = (id, limit = 10) => api.get(`/statistics/restaurant/${id}/popular-dishes`, { params: { limit } });
export const getPeakHours = (id) => api.get(`/statistics/restaurant/${id}/peak-hours`);
export const getFrequentCustomers = (id) => api.get(`/statistics/restaurant/${id}/frequent-customers`);

// No usamos axios para esto porque devuelve un archivo binario.
export const exportOrdersExcelUrl = (id) => `${api.defaults.baseURL}/statistics/restaurant/${id}/export-excel`;
export const downloadOrderPdfUrl = (id, token) => `${api.defaults.baseURL}/orders/${id}/invoice${token ? `?token=${token}` : ''}`;

export const getGlobalOverview = () => api.get('/statistics/global/overview');
export const getGlobalVipClients = () => api.get('/statistics/global/vip-clients');


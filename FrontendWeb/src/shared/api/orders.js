import { pedidosApi as api } from './axios';

export const getOrders = (params = {}) => api.get('/orders', { params });
export const getInvoice = (orderId) => api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });



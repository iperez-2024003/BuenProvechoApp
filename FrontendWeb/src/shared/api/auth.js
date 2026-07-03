import api from './axios';

export const getManagers = () => api.get('/auth/managers');
export const createManager = (data) => api.post('/auth/create-manager', data);
export const updateManagerRestaurant = (managerId, restaurantId) => 
  api.patch(`/auth/managers/${managerId}/restaurant`, { restaurant_id: restaurantId });
export const deleteManager = (managerId) => api.delete(`/auth/managers/${managerId}`);

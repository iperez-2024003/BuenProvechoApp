import { restaurantesApi as api } from './axios';

/**
 * Obtiene todos los restaurantes activos con paginación y filtros opcionales
 * @param {Object} params - Filtros: page, limit, search, category, is_verified
 */
export const getRestaurants = (params = {}) =>
  api.get('/restaurants', { params });

/**
 * Obtiene un restaurante por su ID
 * @param {string} id
 */
export const getRestaurantById = (id) =>
  api.get(`/restaurants/${id}`);

/**
 * Crea un restaurante nuevo (solo SUPER_ADMIN)
 * @param {Object} data - Body del restaurante
 */
export const createRestaurant = (data) =>
  api.post('/restaurants', data);

/**
 * Actualiza un restaurante existente (solo SUPER_ADMIN)
 * @param {string} id
 * @param {Object} data - Campos a actualizar
 */
export const updateRestaurant = (id, data) =>
  api.put(`/restaurants/${id}`, data);

/**
 * Desactiva (soft-delete) un restaurante (solo SUPER_ADMIN)
 * @param {string} id
 */
export const deleteRestaurant = (id) =>
  api.delete(`/restaurants/${id}`);

/**
 * Marca un restaurante como verificado (solo SUPER_ADMIN)
 * @param {string} id
 */
export const verifyRestaurant = (id) =>
  api.patch(`/restaurants/${id}/verify`);

/**
 * Obtiene las estadísticas de un restaurante (solo SUPER_ADMIN)
 * @param {string} id
 */
export const getRestaurantStats = (id) =>
  api.get(`/restaurants/${id}/stats`);


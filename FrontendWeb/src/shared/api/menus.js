import { restaurantesApi as api } from './axios';

/**
 * Obtiene todos los menús (categorías) de un restaurante
 * @param {string} restaurantId 
 */
export const getMenus = (restaurantId) => 
  api.get('/menus', { params: { restaurant_id: restaurantId } });

/**
 * Crea una nueva categoría de menú
 */
export const createMenu = (data) => 
  api.post('/menus', data);

/**
 * Obtiene los platillos de un restaurante o categoría
 * @param {Object} params - restaurant_id, menu_id, search, etc.
 */
export const getMenuItems = (params = {}) => 
  api.get('/menus/items/all', { params });

/**
 * Crea un nuevo platillo (FormData para imagen)
 */
export const createMenuItem = (formData) => 
  api.post('/menus/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

/**
 * Actualiza un platillo (FormData para imagen)
 */
export const updateMenuItem = (id, formData) => 
  api.put(`/menus/items/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

/**
 * Elimina un platillo permanentemente
 */
export const deleteMenuItem = (id) => 
  api.delete(`/menus/items/${id}`);

/**
 * Cambia disponibilidad de un platillo
 */
export const toggleMenuItem = (id) => 
  api.patch(`/menus/items/${id}/toggle`);


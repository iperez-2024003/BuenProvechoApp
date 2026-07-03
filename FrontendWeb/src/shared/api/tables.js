import { restaurantesApi as api } from './axios';

/**
 * Obtiene todas las mesas de un restaurante
 */
export const getTables = (restaurantId, extraParams = {}) =>
  api.get('/tables', { params: { restaurant_id: restaurantId, ...extraParams } });

/**
 * Crea una nueva mesa
 */
export const createTable = (data) => 
  api.post('/tables', data);

/**
 * Actualiza una mesa
 */
export const updateTable = (id, data) => 
  api.put(`/tables/${id}`, data);

/**
 * Actualiza solo el estado de una mesa
 */
export const updateTableStatus = (id, status) => 
  api.patch(`/tables/${id}/status`, { status });

/**
 * Elimina una mesa permanentemente
 */
export const deleteTable = (id) => 
  api.delete(`/tables/${id}`);


'use strict';

// En microservicios, el User model (PostgreSQL) vive en AuthService.
// Este helper consulta al AuthService por HTTP para obtener datos de usuarios.

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3006';

export const User = {
  /**
   * Busca un usuario por ID llamando al AuthService
   */
  findByPk: async (userId) => {
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/api/v1/users/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000),
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data?.data || data?.user || null;
    } catch {
      return null;
    }
  },

  /**
   * Cuenta total de usuarios llamando al AuthService
   */
  count: async () => {
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/api/v1/users?limit=1`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000),
      });
      if (!response.ok) return 0;
      const data = await response.json();
      return data?.data?.pagination?.total || 0;
    } catch {
      return 0;
    }
  },

  /**
   * Cuenta staff de un restaurante llamando al AuthService
   */
  countByRestaurant: async (restaurantId) => {
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/api/v1/users/restaurant/${restaurantId}/count`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000),
      });
      if (!response.ok) return 0;
      const data = await response.json();
      return data?.data?.count || 0;
    } catch {
      return 0;
    }
  },
  /**
   * Obtiene usuarios de un restaurante llamando al AuthService
   */
  findByRestaurant: async (restaurantId, limit = 5) => {
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/api/v1/users/restaurant/${restaurantId}?limit=${limit}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000),
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data?.data || [];
    } catch {
      return [];
    }
  },
};

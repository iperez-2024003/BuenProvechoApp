'use strict';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3006';

export const User = {
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
};

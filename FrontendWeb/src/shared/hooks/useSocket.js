import { useEffect } from 'react';
import { socket } from '../api/socket';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { showSuccess } from '../utils/toast';

export const useSocket = (restaurantId) => {
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    if (restaurantId) {
      socket.emit('join_restaurant', restaurantId);
    }

    return () => {
      // Opcional: Salir de la sala al desmontar
      // socket.emit('leave_restaurant', restaurantId);
    };
  }, [restaurantId]);

  return { socket };
};

export const useSocketEvent = (event, callback) => {
  useEffect(() => {
    socket.on(event, callback);
    return () => {
      socket.off(event, callback);
    };
  }, [event, callback]);
};

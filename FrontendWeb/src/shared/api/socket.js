import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_PEDIDOS_URL || 'http://localhost:3008';
// Note: We remove /api/v1 from the base URL for the socket connection
const cleanUrl = SOCKET_URL.replace('/api/v1', '');

export const socket = io(cleanUrl, {
  autoConnect: false,
  reconnection: true,
});

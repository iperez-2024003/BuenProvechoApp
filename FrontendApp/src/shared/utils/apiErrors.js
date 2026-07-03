const errorMessages = {
  'USER_NOT_FOUND': 'Usuario o contraseña incorrectos',
  'INVALID_PASSWORD': 'Usuario o contraseña incorrectos',
  'INVALID_CREDENTIALS': 'Usuario o contraseña incorrectos',
  'TOKEN_EXPIRED': 'Sesión expirada, inicia sesión nuevamente',
  'MISSING_TOKEN': 'Sesión no válida, inicia sesión nuevamente',
};

export const translateApiError = (error) => {
  if (!error) return 'Servicio temporalmente no disponible, intenta más tarde';

  const code = error.response?.data?.code;
  if (code && errorMessages[code]) return errorMessages[code];

  const status = error.response?.status;
  if (!error.response || !status) return 'Servicio temporalmente no disponible, intenta más tarde';
  if (status >= 500) return 'Servicio temporalmente no disponible, intenta más tarde';
  if (status === 409) return error.response?.data?.message || 'El recurso ya existe';
  if (status === 404) return 'Recurso no encontrado';
  if (status === 403) return 'No tienes permisos para realizar esta acción';

  return error.response?.data?.message || 'Servicio temporalmente no disponible, intenta más tarde';
};

export const isUnverifiedAccount = (error) => {
  const message = error?.response?.data?.message || '';
  return message.toLowerCase().includes('verificar') || message.toLowerCase().includes('verified');
};

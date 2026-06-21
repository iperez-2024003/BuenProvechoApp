const exactMessageMap = {
  'No encontrado': 'No encontrado',
  'Validation errors': 'Hay errores de validación en los datos ingresados.',
  'Creado exitosamente': 'Creado exitosamente.',
  'Actualizado exitosamente': 'Actualizado exitosamente.',
  'Datos obtenidos exitosamente': 'Datos obtenidos exitosamente.',
  'Restaurant ID is required': 'El ID del restaurante es obligatorio.',
  'Missing required parameters: restaurant_id, reservation_date, reservation_time, party_size':
    'Faltan parámetros requeridos para validar disponibilidad.',
  'Availability checked successfully': 'Disponibilidad validada correctamente.',
  'Reservation confirmed successfully': 'Reservación confirmada exitosamente.',
  'Reservation cancelled successfully': 'Reservación cancelada exitosamente.',
  'Event is full, no spots available': 'El evento está lleno, no hay cupos disponibles.',
  'Registered successfully for event': 'Inscripción al evento realizada con éxito.',
  'This email is already registered for this event': 'Este correo ya está inscrito en este evento.',
  'Event date must be in the future': 'La fecha del evento debe ser futura.',
  'End time must be after start time': 'La hora de finalización debe ser mayor que la hora de inicio.',
};

export const translateStatus = (status) => {
  const map = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    seated: 'Sentado',
    completed: 'Finalizada',
    cancelled: 'Cancelada',
    no_show: 'No asistió',
    preparing: 'En preparación',
    ready: 'Listo',
    served: 'Entregado',
    paid: 'Pagado',
    scheduled: 'Programado',
    ongoing: 'En curso',
    registered: 'Inscrito',
    available: 'Disponible',
    occupied: 'Ocupada',
    reserved: 'Reservada',
    cleaning: 'Limpieza',
  };

  return map[status] || status;
};

export const translateEventType = (eventType) => {
  const map = {
    tasting: 'Cata',
    cooking_class: 'Clase de cocina',
    wine_pairing: 'Maridaje',
    theme_dinner: 'Cena temática',
    festival: 'Festival',
    promotion: 'Promoción',
    live_music: 'Música en vivo',
    other: 'Otro',
  };
  return map[eventType] || eventType;
};

export const translateApiMessage = (message = '') => {
  if (!message) return 'Ocurrió un error inesperado.';
  if (exactMessageMap[message]) return exactMessageMap[message];

  const lower = message.toLowerCase();
  if (lower.includes('restaurant is closed on')) return 'El restaurante está cerrado en ese día.';
  if (lower.includes('must be a valid email')) return 'Debes ingresar un correo electrónico válido.';
  if (lower.includes('email') && lower.includes('not found')) return 'Correo electrónico no reconocido.';
  if (lower.includes('invalid credentials')) return 'Credenciales inválidas.';
  if (lower.includes('token')) return 'Tu sesión no es válida o expiró. Inicia sesión nuevamente.';
  if (lower.includes('not found')) return 'No encontrado.';
  if (lower.includes('already exists')) return 'El registro ya existe.';
  if (lower.includes('already')) return 'Esta operación ya fue realizada anteriormente.';
  if (lower.includes('required')) return 'Faltan campos obligatorios.';
  if (lower.includes('server')) return 'Ocurrió un error interno del servidor.';

  return message;
};


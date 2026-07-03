import { randomUUID } from 'crypto';

export const errorHandler = (err, req, res, _next) => {
  console.error('Error:', err);
  const traceId = err.traceId || randomUUID();
  const timestamp = new Date().toISOString();

  if (err.name === 'ValidationError') {
    const errors = err.errors?.map((e) => ({ field: e.path || e.field, message: e.message })) || [];
    return res.status(400).json({ success: false, message: 'Error de validación', errors, traceId, timestamp });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'ID inválido', traceId, timestamp });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(400).json({ success: false, message: field ? `El ${field} ya está en uso` : 'El registro ya existe', traceId, timestamp });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Token inválido', traceId, timestamp });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expirado', traceId, timestamp });
  }

  if (err.message && err.message.includes('CORS:')) {
    return res.status(403).json({ success: false, message: err.message, traceId, timestamp });
  }

  if (err.status) {
    return res.status(err.status).json({ success: false, message: err.message, traceId, timestamp });
  }

  return res.status(500).json({ success: false, message: 'Error interno del servidor', traceId, timestamp });
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

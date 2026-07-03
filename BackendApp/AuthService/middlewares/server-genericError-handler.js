import { randomUUID } from 'crypto';

/**
 * Middleware global para el manejo de errores
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  console.error('Error:', err);
  const traceId = err.traceId || randomUUID();
  const timestamp = new Date().toISOString();
  const errorCode = err.errorCode || null;

  // Error de validación (Mongoose o Sequelize)
  if (err.name === 'ValidationError' || err.name === 'SequelizeValidationError') {
    const errors = err.errors?.map((e) => ({ field: e.path || e.field, message: e.message })) || [];
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: errors.length ? errors : undefined,
      errorCode,
      traceId,
      timestamp,
    });
  }

  // Error de cast de Mongoose (ID inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido',
      errorCode,
      traceId,
      timestamp,
    });
  }

  // Sequelize: restricción única (campo duplicado)
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors?.[0]?.path || 'campo';
    return res.status(409).json({
      success: false,
      message: `El valor de ${field} ya está en uso`,
      errorCode,
      traceId,
      timestamp,
    });
  }

  // Sequelize: UUID o formato inválido (p. ej. PostgreSQL "invalid input syntax for type uuid")
  if (err.name === 'SequelizeDatabaseError' && /invalid|uuid|syntax/i.test(err.message || '')) {
    return res.status(400).json({
      success: false,
      message: 'ID o parámetro con formato inválido',
      errorCode,
      traceId,
      timestamp,
    });
  }

  // Error de duplicado de Mongoose
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    const value = err.keyValue?.[field];
    return res.status(400).json({
      success: false,
      message: field && value ? `El ${field} '${value}' ya está en uso` : 'El registro ya existe',
      errorCode,
      traceId,
      timestamp,
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      errorCode,
      traceId,
      timestamp,
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado',
      errorCode,
      traceId,
      timestamp,
    });
  }

  // Error de multer (archivos)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'El archivo es demasiado grande',
      errorCode,
      traceId,
      timestamp,
    });
  }

  // Error de conexión a base de datos (Mongo o Sequelize)
  if (err.name === 'MongoNetworkError' || err.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      success: false,
      message: 'Error de conexión a la base de datos',
      errorCode,
      traceId,
      timestamp,
    });
  }

  // Error personalizado con status
  if (err.status) {
    return res.status(err.status).json({
      success: false,
      message: err.message || 'Error del servidor',
      errorCode: err.errorCode || null,
      traceId,
      timestamp,
    });
  }

  // Error genérico del servidor
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    errorCode,
    traceId,
    timestamp,
  });
};

/**
 * Middleware para manejar rutas no encontradas
 */
export const notFound = (req, res) => {
  const traceId = randomUUID();
  const timestamp = new Date().toISOString();
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`,
    errorCode: null,
    traceId,
    timestamp,
  });
};

/**
 * Wrapper para manejar errores en funciones asíncronas
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

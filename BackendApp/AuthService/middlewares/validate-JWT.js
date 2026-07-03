import { verifyJWT } from '../helpers/generate-jwt.js';
import { findUserById } from '../helpers/user-db.js';

/**
 * Middleware para validar JWT
 */
export const validateJWT = async (req, res, next) => {
  try {
    let token =
      req.header('x-token') ||
      req.header('authorization') ||
      req.body?.token ||
      req.query?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No hay token en la petición',
      });
    }

    // Limpiar el token si viene con Bearer
    token = token.replace(/^Bearer\s+/, '');

    // Verificar el token
    const decoded = await verifyJWT(token);

    // Buscar el usuario por ID (decoded.sub es string)
    const user = await findUserById(decoded.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token no válido - Usuario no existe',
      });
    }

    // Verificar si el usuario está activo
    if (!user.Status) {
      return res.status(423).json({
        success: false,
        message: 'Cuenta desactivada. Contacta al administrador.',
      });
    }

    // Agregar el usuario al request (user incluye UserRoles + Role para middlewares de rol)
    req.user = user;
    req.userId = user.Id.toString();
    req.userRoleNames =
      user.UserRoles?.map((ur) => ur?.Role?.Name).filter(Boolean) ?? [];

    next();
  } catch (error) {
    console.error('Error validating JWT:', error);

    let message = 'Error al verificar el token';

    if (error.name === 'TokenExpiredError') {
      message = 'Token expirado';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Token inválido';
    }

    return res.status(401).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
/**
 * Middleware para validar JWT opcionalmente (no bloquea si no hay token)
 */
export const optionalValidateJWT = async (req, res, next) => {
  try {
    let token =
      req.header('x-token') ||
      req.header('authorization') ||
      req.body.token ||
      req.query.token;

    if (!token) {
      return next();
    }

    token = token.replace(/^Bearer\s+/, '');
    const decoded = await verifyJWT(token);
    const user = await findUserById(decoded.sub);

    if (user && user.Status) {
      req.user = user;
      req.userId = user.Id.toString();
      req.userRoleNames = user.UserRoles?.map((ur) => ur?.Role?.Name).filter(Boolean) ?? [];
    }

    next();
  } catch (error) {
    // Si el token es inválido o expiró, simplemente seguimos sin usuario (comportamiento opcional)
    next();
  }
};

import jwt from 'jsonwebtoken';

export const validateJWT = (req, res, next) => {
  const jwtConfig = {
    secret: process.env.JWT_SECRET,
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
  };

  if (!jwtConfig.secret) {
    console.error('Error de validación JWT: JWT_SECRET no está definido');
    return res.status(500).json({
      success: false,
      message: 'Configuración del servidor inválida: falta JWT_SECRET',
    });
  }

  const token =
    req.header('x-token') ||
    req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No se proporcionó un token',
      error: 'MISSING_TOKEN',
    });
  }

  try {
    const verifyOptions = {};
    if (jwtConfig.issuer) verifyOptions.issuer = jwtConfig.issuer;
    if (jwtConfig.audience) verifyOptions.audience = jwtConfig.audience;

    const decoded = jwt.verify(token, jwtConfig.secret, verifyOptions);

    // Compatibilidad con el formato del AuthService original
    req.userId = decoded.sub || decoded.uid;
    req.userRole = decoded.role || 'CLIENT_ROLE';
    req.userRoleNames = decoded.role ? [decoded.role] : ['CLIENT_ROLE'];

    // Compatibilidad con el middleware require-role del monolito
    req.user = {
      id: decoded.sub || decoded.uid,
      jti: decoded.jti,
      iat: decoded.iat,
      role: decoded.role || 'CLIENT_ROLE',
      email: decoded.email || null,
      name: decoded.name || null,
      surname: decoded.surname || null,
    };

    req.usuario = req.user;

    next();
  } catch (error) {
    console.error(`Error validando JWT: ${error.message}`);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
        error: 'TOKEN_EXPIRED',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
        error: 'INVALID_TOKEN',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al validar el token',
      error: error.message,
    });
  }
};

// ─── Role helpers ───────────────────────────────────────────────────────────
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.userRole || req.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción',
      });
    }
    next();
  };
};

export const requireSuperAdmin = requireRole('SUPER_ADMIN_ROLE');
export const requireAdmin = requireRole('SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE');
export const requireRestaurantAdmin = requireRole('RESTAURANT_ADMIN_ROLE');
export const requireClient = requireRole('CLIENT_ROLE');

export const getRequestUserRoleNames = (req) => {
  return req.userRoleNames || [req.userRole] || [];
};

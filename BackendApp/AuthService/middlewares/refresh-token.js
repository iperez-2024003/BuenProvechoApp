'use strict';

import { validateRefreshToken } from '../helpers/refresh-token-db.js';

export const extractRefreshTokenFromRequest = (req) => {
  return (
    req.cookies?.refreshToken ||
    req.body?.refreshToken ||
    req.headers['x-refresh-token'] ||
    (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null)
  );
};

export const validateRefreshTokenMiddleware = async (req, res, next) => {
  try {
    const token = extractRefreshTokenFromRequest(req);

    if (!token) {
      return res.status(400).json({ success: false, message: 'refreshToken es requerido' });
    }

    const validation = await validateRefreshToken(token);
    if (!validation.valid) {
      return res.status(401).json({ success: false, message: 'Refresh token inválido o expirado' });
    }

    req.refreshTokenRecord = validation.rt;
    next();
  } catch (err) {
    console.error('Error en validateRefreshTokenMiddleware:', err);
    return res.status(500).json({ success: false, message: 'Error interno' });
  }
};

export default validateRefreshTokenMiddleware;

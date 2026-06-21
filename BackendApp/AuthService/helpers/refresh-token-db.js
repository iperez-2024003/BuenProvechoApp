'use strict';

import crypto from 'crypto';
import RefreshToken from '../src/auth/refresh-token.model.js';
import { config } from '../configs/config.js';

export const generateRefreshTokenString = () => crypto.randomBytes(48).toString('hex');

export const createRefreshToken = async (userId) => {
  const token = generateRefreshTokenString();
  const expiresIn = config.jwt.refreshExpiresIn || '7d';
  // Support formats like '7d' or milliseconds
  let expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  if (typeof expiresIn === 'string' && expiresIn.endsWith('d')) {
    const days = parseInt(expiresIn.replace('d', ''), 10) || 7;
    expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  const rt = await RefreshToken.create({
    Token: token,
    UserId: userId,
    ExpiresAt: expiresAt,
    Revoked: false,
  });

  return { token: rt.Token, expiresAt: rt.ExpiresAt };
};

export const findRefreshToken = async (token) => {
  if (!token) return null;
  return RefreshToken.findOne({ where: { Token: token } });
};

export const revokeRefreshToken = async (token) => {
  const rt = await findRefreshToken(token);
  if (!rt) return false;
  rt.Revoked = true;
  await rt.save();
  return true;
};

export const revokeAllUserRefreshTokens = async (userId) => {
  await RefreshToken.update({ Revoked: true }, { where: { UserId: userId } });
};

export const revokeRefreshTokenFamily = async (userId) => {
  if (!userId) return false;
  await RefreshToken.update({ Revoked: true }, { where: { UserId: userId } });
  return true;
};

export const validateRefreshToken = async (token) => {
  if (!token) return { valid: false, reason: 'missing' };
  const rt = await RefreshToken.findOne({ where: { Token: token } });
  if (!rt) return { valid: false, reason: 'not_found' };
  if (rt.Revoked) return { valid: false, reason: 'revoked', rt };
  if (new Date(rt.ExpiresAt) < new Date()) return { valid: false, reason: 'expired', rt };
  return { valid: true, rt };
};

export default {
  createRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  revokeRefreshTokenFamily,
};

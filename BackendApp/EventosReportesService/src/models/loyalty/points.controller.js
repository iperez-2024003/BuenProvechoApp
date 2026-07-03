'use strict';

import * as pointsService from './points.service.js';
import * as couponsService from './coupons.service.js';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3006';

const generateCouponCode = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `BP-VIP-${num}`;
};

export const getPointsHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const history = await pointsService.fetchPointsHistory(userId);
    return res.status(200).json({ ok: true, message: 'Datos obtenidos exitosamente', history });
  } catch (error) {
    console.error('Error getting points history:', error);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const redeemPoints = async (req, res) => {
  try {
    const userId = req.userId;
    const rawCost = req.body.cost;
    const cost = typeof rawCost === 'string' ? parseInt(rawCost, 10) : rawCost;
    const prize_name = req.body.prize_name;

    if (!Number.isInteger(cost) || cost <= 0) {
      return res.status(400).json({ ok: false, message: 'El costo debe ser un número entero positivo' });
    }

    if (!prize_name || typeof prize_name !== 'string') {
      return res.status(400).json({ ok: false, message: 'El nombre del premio es requerido' });
    }

    // Extract the JWT from the incoming request to forward to AuthService
    const authHeader = req.header('Authorization') || req.header('x-token');
    if (!authHeader) {
      return res.status(401).json({ ok: false, message: 'Token de autenticación requerido' });
    }

    // Call AuthService to deduct points
    const authResponse = await fetch(`${AUTH_SERVICE_URL}/api/v1/auth/profile/redeem-points`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader.startsWith('Bearer ') ? authHeader : `Bearer ${authHeader}`,
      },
      body: JSON.stringify({ cost }),
      signal: AbortSignal.timeout(5000),
    });

    if (!authResponse.ok) {
      const errorData = await authResponse.json().catch(() => ({}));
      return res.status(authResponse.status).json({ ok: false, message: errorData.message || 'Error al canjear puntos en AuthService' });
    }

    const authData = await authResponse.json();
    const newPoints = authData?.data?.points || 0;

    // Generate coupon code
    const code = generateCouponCode();
    const expiration_date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Create coupon record
    const coupon = await couponsService.createCoupon(userId, code, prize_name, expiration_date);

    // Create point transaction record
    await pointsService.createTransaction(userId, cost, 'redeemed', `Canje por: ${prize_name}`);

    return res.status(201).json({
      ok: true,
      message: 'Puntos canjeados exitosamente',
      coupon: {
        id: coupon._id,
        code: coupon.code,
        prize_name: coupon.prize_name,
        expiration_date: coupon.expiration_date,
        status: coupon.status,
      },
      points: newPoints,
    });
  } catch (error) {
    console.error('Error redeeming points:', error);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

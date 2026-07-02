'use strict';

import * as couponsService from './coupons.service.js';

export const getActiveCoupons = async (req, res) => {
  try {
    const userId = req.userId;
    const coupons = await couponsService.fetchActiveCoupons(userId);
    return res.status(200).json({ ok: true, message: 'Datos obtenidos exitosamente', coupons });
  } catch (error) {
    console.error('Error getting active coupons:', error);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const userId = req.userId;
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ ok: false, message: 'El código del cupón es requerido' });
    }

    // First find the coupon to verify ownership
    const coupon = await couponsService.findActiveCouponByCode(code);
    if (!coupon) {
      return res.status(400).json({ ok: false, message: 'Cupón no válido, ya utilizado o no encontrado' });
    }

    if (coupon.userId !== userId) {
      return res.status(403).json({ ok: false, message: 'Este cupón no pertenece al usuario actual' });
    }

    // Mark as used
    const updated = await couponsService.markCouponAsUsed(code);
    if (!updated) {
      return res.status(400).json({ ok: false, message: 'Error al marcar el cupón como utilizado' });
    }

    return res.status(200).json({
      ok: true,
      message: 'Cupón validado exitosamente',
      coupon: {
        id: updated._id,
        code: updated.code,
        prize_name: updated.prize_name,
        status: updated.status,
        used: updated.used,
      },
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return res.status(500).json({ ok: false, message: 'Error interno del servidor', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

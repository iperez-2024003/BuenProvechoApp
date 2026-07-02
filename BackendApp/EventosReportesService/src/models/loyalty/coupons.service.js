'use strict';
import Coupon from './coupons.model.js';

export const fetchActiveCoupons = async (userId) => {
  const coupons = await Coupon.find({ userId, status: 'active' })
    .sort({ createdAt: -1 })
    .lean();
  return coupons;
};

export const createCoupon = async (userId, code, prize_name, expiration_date) => {
  const coupon = await Coupon.create({ userId, code, prize_name, expiration_date, status: 'active', used: false });
  return coupon;
};

export const findActiveCouponByCode = async (code) => {
  const coupon = await Coupon.findOne({ code, status: 'active', used: false }).lean();
  return coupon;
};

export const markCouponAsUsed = async (code) => {
  const coupon = await Coupon.findOneAndUpdate(
    { code, status: 'active', used: false },
    { used: true, status: 'redeemed' },
    { new: true }
  );
  return coupon;
};

export default {
  fetchActiveCoupons,
  createCoupon,
  findActiveCouponByCode,
  markCouponAsUsed,
};

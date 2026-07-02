'use strict';
import PointTransaction from './points.model.js';

export const fetchPointsHistory = async (userId) => {
  const transactions = await PointTransaction.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
  return transactions;
};

export const createTransaction = async (userId, amount, type, description) => {
  const transaction = await PointTransaction.create({ userId, amount, type, description });
  return transaction;
};

export default {
  fetchPointsHistory,
  createTransaction,
};

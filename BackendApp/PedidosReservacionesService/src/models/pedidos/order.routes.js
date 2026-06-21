'use strict';

import { Router } from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  addItemToOrder,
  removeItemFromOrder,
  generateOrderPDF,
  getKitchenOrders,
} from './order.controller.js';
import { validateJWT } from '../../../middlewares/validate-JWT.js';
import { requireRole } from '../../../middlewares/require-role.js';
import { validateUuidParam, validateUuidParams } from '../../../middlewares/validate-params.js';
import { validateOrderCreation, validateAddItem, validateOrderStatusUpdate } from './order.validation.js';

const router = Router();
const requireOperationalStaff = requireRole('SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE', 'STAFF_ROLE');

router.post('/', [validateJWT, validateOrderCreation], createOrder);
router.get('/', validateJWT, getAllOrders);
router.get('/kitchen/:restaurantId', [validateJWT, requireOperationalStaff, validateUuidParam('restaurantId')], getKitchenOrders);
router.get('/:id/invoice', validateJWT, validateUuidParam('id'), generateOrderPDF);
router.get('/:id', validateJWT, validateUuidParam('id'), getOrderById);
router.delete('/:id', validateJWT, validateUuidParam('id'), cancelOrder);
router.post('/:id/items', [validateJWT, validateUuidParam('id'), validateAddItem], addItemToOrder);
router.delete('/:id/items/:itemId', validateJWT, validateUuidParams('id', 'itemId'), removeItemFromOrder);
router.patch('/:id/status', [validateJWT, requireOperationalStaff, validateUuidParam('id'), validateOrderStatusUpdate], updateOrderStatus);

export default router;
'use strict';

import { Router } from 'express';
import { sendOrderInvoice, getDailyReport, downloadDailyExcelReport } from './report.controller.js';
import { validateJWT } from '../../../middlewares/validate-JWT.js';
import { requireAdmin, requireRestaurantAdmin, requireClient, requireRole } from '../../../middlewares/require-role.js';

const router = Router();

/**
 * @route POST /api/v1/reports/send-invoice/:orderId
 * @desc Envía la factura de la orden al correo del cliente
 * @access Private (Client o Admin)
 */
router.post('/send-invoice/:orderId', [validateJWT], sendOrderInvoice);

/**
 * @route GET /api/v1/reports/daily-summary/:restaurantId
 * @desc Genera reporte diario (Solo Restaurant Admin o Super Admin)
 * @access Private
 */
const requireAdminOrRestaurantAdmin = requireRole('SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE');

router.get('/daily-summary/:restaurantId', [validateJWT, requireAdminOrRestaurantAdmin], getDailyReport);
router.get('/daily-excel/:restaurantId', [validateJWT, requireAdminOrRestaurantAdmin], downloadDailyExcelReport);

export default router;

'use strict';

import { Router } from 'express';
import {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservation,
  cancelReservation,
  confirmReservation,
  checkAvailability,
  getTodayReservations,
} from './reservation.controller.js';
import { validateJWT } from '../../../middlewares/validate-JWT.js';
import { requireRole } from '../../../middlewares/require-role.js';
import { validateUuidParam } from '../../../middlewares/validate-params.js';
import {
  validateReservationCreation,
  validateReservationUpdate,
  validateCheckAvailability,
} from './reservation.validation.js';

const router = Router();
const requireOperationalStaff = requireRole('SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE', 'STAFF_ROLE');

router.get('/check-availability', validateCheckAvailability, checkAvailability);
router.post('/', [validateJWT, validateReservationCreation], createReservation);
router.get('/today', validateJWT, getTodayReservations);
router.get('/', validateJWT, getAllReservations);
router.get('/:id', validateJWT, validateUuidParam('id'), getReservationById);
router.put('/:id', [validateJWT, validateUuidParam('id'), validateReservationUpdate], updateReservation);
router.delete('/:id', validateJWT, validateUuidParam('id'), cancelReservation);
router.patch('/:id/confirm', [validateJWT, requireOperationalStaff, validateUuidParam('id')], confirmReservation);

export default router;
'use strict';

import { Router } from 'express';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  cancelEvent,
  deleteEvent,
  registerParticipant,
  unregisterParticipant,
  getEventParticipants,
  updateParticipantStatus,
} from './event.controller.js';
import { validateJWT } from '../../../middlewares/validate-JWT.js';
import { requireSuperAdmin, requireRole } from '../../../middlewares/require-role.js';
import { validateMongoIdParam } from '../../../middlewares/validate-params.js';
import {
  validateEventCreation,
  validateEventUpdate,
  validateParticipantRegistration,
} from './event.validation.js';

const router = Router();
const requireAdminOrRestaurantAdmin = requireRole('SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE');

router.get('/', getAllEvents);
router.get('/:id', validateMongoIdParam('id'), getEventById);
router.post('/', [validateJWT, requireAdminOrRestaurantAdmin, validateEventCreation], createEvent);
router.put('/:id', [validateJWT, requireAdminOrRestaurantAdmin, validateMongoIdParam('id'), validateEventUpdate], updateEvent);
router.patch('/:id/cancel', [validateJWT, requireAdminOrRestaurantAdmin, validateMongoIdParam('id')], cancelEvent);
router.delete('/:id', [validateJWT, requireAdminOrRestaurantAdmin, validateMongoIdParam('id')], deleteEvent);
router.post('/:id/register', [validateJWT, validateMongoIdParam('id'), validateParticipantRegistration], registerParticipant);
router.delete('/:id/unregister', validateJWT, validateMongoIdParam('id'), unregisterParticipant);
router.get('/:id/participants', validateJWT, validateMongoIdParam('id'), getEventParticipants);
router.patch('/participants/:participantId', validateJWT, updateParticipantStatus);

export default router;

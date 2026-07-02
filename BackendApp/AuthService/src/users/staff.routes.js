import { Router } from 'express';
import {
  createStaff,
  getRestaurantStaff,
  updateStaffRole,
} from './staff.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireRole } from '../../middlewares/require-role.js';
import { validateUuidParam } from '../../middlewares/validate-params.js';
import { validateStaffCreation, validateStaffRoleUpdate } from '../../middlewares/validation.js';

const router = Router();
const requireAdminOrRestaurantAdmin = requireRole('SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE');

// Montado en /api/v1/restaurants en AuthService
router.get('/:id/staff', [validateJWT, requireAdminOrRestaurantAdmin, validateUuidParam('id')], getRestaurantStaff);
router.post('/:id/staff', [validateJWT, requireAdminOrRestaurantAdmin, validateUuidParam('id'), validateStaffCreation], createStaff);
router.put('/:id/staff/:staff_id', [validateJWT, requireAdminOrRestaurantAdmin, validateUuidParam('id'), validateStaffRoleUpdate], updateStaffRole);

export default router;

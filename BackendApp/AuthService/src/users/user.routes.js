import { Router } from 'express';
import {
  updateUserRole,
  getUserRoles,
  getUsersByRole,
} from './user.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireSuperAdmin } from '../../middlewares/require-role.js';
import { validateUserIdParam, validateRoleNameParam } from '../../middlewares/validate-params.js';

const router = Router();

// GET /by-role/:roleName debe ir antes de /:userId para que no se confunda la ruta
router.get('/by-role/:roleName', validateJWT, requireSuperAdmin, validateRoleNameParam(), ...getUsersByRole);

// PUT /api/v1/users/:userId/role â€” solo ADMIN_ROLE
router.put('/:userId/role', validateJWT, requireSuperAdmin, validateUserIdParam('userId'), ...updateUserRole);

// GET /api/v1/users/:userId/roles â€” usuario puede ver sus propios roles; ver otros requiere ADMIN_ROLE
router.get('/:userId/roles', validateJWT, validateUserIdParam('userId'), ...getUserRoles);

export default router;

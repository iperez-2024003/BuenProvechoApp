'use strict';

import { Router } from 'express';
import {
  createTable,
  getAllTables,
  getTableById,
  updateTable,
  deleteTable,
  updateTableStatus,
  getAvailableTables,
} from './table.controller.js';
import { validateJWT } from '../../../middlewares/validate-JWT.js';
import { requireRole } from '../../../middlewares/require-role.js';
import { validateUuidParam } from '../../../middlewares/validate-params.js';
import {
  validateTableCreation,
  validateTableUpdate,
  validateTableStatusUpdate,
  validateGetAvailableTablesQuery,
} from './table.validation.js';

const router = Router();
const requireTableAdmin = requireRole('SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE');
const requireOperationalStaff = requireRole('SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE', 'STAFF_ROLE');

router.get('/available', validateGetAvailableTablesQuery, getAvailableTables);
router.get('/', getAllTables);
router.get('/:id', validateUuidParam('id'), getTableById);
router.post('/', [validateJWT, requireTableAdmin, validateTableCreation], createTable);
router.put('/:id', [validateJWT, requireTableAdmin, validateUuidParam('id'), validateTableUpdate], updateTable);
router.delete('/:id', [validateJWT, requireTableAdmin, validateUuidParam('id')], deleteTable);
router.patch('/:id/status', [validateJWT, requireOperationalStaff, validateUuidParam('id'), validateTableStatusUpdate], updateTableStatus);

export default router;
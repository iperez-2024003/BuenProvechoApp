'use strict';

import { Router } from 'express';
import {
  createMenu,
  getAllMenus,
  getMenuById,
  updateMenu,
  deleteMenu,
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
} from './menu.controller.js';
import { validateJWT } from '../../../middlewares/validate-JWT.js';
import { requireSuperAdmin, requireRole } from '../../../middlewares/require-role.js';
import { validateUuidParam } from '../../../middlewares/validate-params.js';
import { upload, handleUploadError } from '../../../helpers/file-upload.js';
import {
  validateMenuCreation,
  validateMenuUpdate,
  validateMenuItemCreation,
  validateMenuItemUpdate,
} from './menu.validation.js';

const router = Router();
const requireAdminOrRestaurantAdmin = requireRole('SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE');

const parseMenuItemFormData = (req, res, next) => {
  if (req.body.price) req.body.price = parseFloat(req.body.price);
  if (req.body.preparation_time) req.body.preparation_time = parseInt(req.body.preparation_time);
  if (req.body.calories) req.body.calories = parseInt(req.body.calories);
  if (req.body.stock_quantity) req.body.stock_quantity = parseInt(req.body.stock_quantity);
  if (req.body.is_vegetarian) req.body.is_vegetarian = req.body.is_vegetarian === 'true';
  if (req.body.is_vegan) req.body.is_vegan = req.body.is_vegan === 'true';
  if (req.body.is_gluten_free) req.body.is_gluten_free = req.body.is_gluten_free === 'true';
  if (req.body.is_available) req.body.is_available = req.body.is_available === 'true';

  if (typeof req.body.ingredients === 'string') {
    try { req.body.ingredients = JSON.parse(req.body.ingredients); } catch (e) { req.body.ingredients = []; }
  }
  if (typeof req.body.allergens === 'string') {
    try { req.body.allergens = JSON.parse(req.body.allergens); } catch (e) { req.body.allergens = []; }
  }

  next();
};

router.get('/items/all', getAllMenuItems);
router.get('/items/:id', validateUuidParam('id'), getMenuItemById);
router.post('/items', [validateJWT, requireAdminOrRestaurantAdmin, upload.single('image'), handleUploadError, parseMenuItemFormData, validateMenuItemCreation], createMenuItem);
router.put('/items/:id', [validateJWT, requireAdminOrRestaurantAdmin, validateUuidParam('id'), upload.single('image'), handleUploadError, parseMenuItemFormData, validateMenuItemUpdate], updateMenuItem);
router.delete('/items/:id', [validateJWT, requireAdminOrRestaurantAdmin, validateUuidParam('id')], deleteMenuItem);
router.patch('/items/:id/toggle', [validateJWT, requireAdminOrRestaurantAdmin, validateUuidParam('id')], toggleMenuItemAvailability);

router.get('/', getAllMenus);
router.get('/:id', validateUuidParam('id'), getMenuById);
router.post('/', [validateJWT, requireAdminOrRestaurantAdmin, validateMenuCreation], createMenu);
router.put('/:id', [validateJWT, requireAdminOrRestaurantAdmin, validateUuidParam('id'), validateMenuUpdate], updateMenu);
router.delete('/:id', [validateJWT, requireAdminOrRestaurantAdmin, validateUuidParam('id')], deleteMenu);

export default router;
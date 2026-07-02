'use strict';

import { Router } from 'express';
import {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantsByAdmin,
  verifyRestaurant,
  getRestaurantStats,
  getServerIp,
  search,
} from './restaurant.controller.js';
import { validateJWT } from '../../../middlewares/validate-JWT.js';
import { requireSuperAdmin, requireRole } from '../../../middlewares/require-role.js';
import { validateUuidParam, validateUserIdParam } from '../../../middlewares/validate-params.js';
import { upload, handleUploadError } from '../../../helpers/file-upload.js';
import { validateRestaurantCreation, validateRestaurantUpdate } from './restaurant.validation.js';

const router = Router();
const requireAdminOrRestaurantAdmin = requireRole('SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE', 'STAFF_ROLE');

const parseRestaurantFormData = (req, res, next) => {
  if (req.body.operating_days && typeof req.body.operating_days === 'string') {
    try {
      req.body.operating_days = JSON.parse(req.body.operating_days);
    } catch (error) {
      req.body.operating_days = req.body.operating_days.split(',');
    }
  }

  ['accepts_reservations', 'accepts_takeout', 'accepts_delivery', 'parking_available', 'wifi_available', 'outdoor_seating', 'pet_friendly', 'wheelchair_accessible'].forEach((field) => {
    if (req.body[field] !== undefined) {
      req.body[field] = req.body[field] === 'true' || req.body[field] === true;
    }
  });

  if (req.body.payment_methods && typeof req.body.payment_methods === 'string') {
    try {
      req.body.payment_methods = JSON.parse(req.body.payment_methods);
    } catch (error) {
      req.body.payment_methods = req.body.payment_methods.split(',');
    }
  }

  if (req.body.special_features && typeof req.body.special_features === 'string') {
    try {
      req.body.special_features = JSON.parse(req.body.special_features);
    } catch (error) {
      req.body.special_features = req.body.special_features.split(',');
    }
  }

  next();
};

router.get('/utils/server-ip', getServerIp);
router.get('/search', search);
router.get('/', getAllRestaurants);
router.get('/admin/:adminId', [validateJWT, requireSuperAdmin, validateUserIdParam('adminId')], getRestaurantsByAdmin);
router.get('/:id/stats', [validateJWT, requireAdminOrRestaurantAdmin, validateUuidParam('id')], getRestaurantStats);
router.patch('/:id/verify', [validateJWT, requireSuperAdmin, validateUuidParam('id')], verifyRestaurant);


router.get('/:id', validateUuidParam('id'), getRestaurantById);
router.post('/', [validateJWT, requireRole('SUPER_ADMIN_ROLE', 'RESTAURANT_ADMIN_ROLE'), upload.single('logo'), handleUploadError, parseRestaurantFormData, validateRestaurantCreation], createRestaurant);
router.put('/:id', [validateJWT, requireAdminOrRestaurantAdmin, validateUuidParam('id'), upload.single('logo'), handleUploadError, parseRestaurantFormData, validateRestaurantUpdate], updateRestaurant);
router.delete('/:id', [validateJWT, requireSuperAdmin, validateUuidParam('id')], deleteRestaurant);

export default router;
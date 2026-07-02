'use strict';

import { Router } from 'express';
import { getActiveCoupons, validateCoupon } from './coupons.controller.js';
import { validateJWT } from '../../../middlewares/validate-JWT.js';

const router = Router();

router.get('/active', validateJWT, getActiveCoupons);
router.post('/validate', validateJWT, validateCoupon);

export default router;

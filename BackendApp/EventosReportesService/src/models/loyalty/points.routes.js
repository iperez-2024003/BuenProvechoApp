'use strict';

import { Router } from 'express';
import { getPointsHistory, redeemPoints } from './points.controller.js';
import { validateJWT } from '../../../middlewares/validate-JWT.js';

const router = Router();

router.get('/history', validateJWT, getPointsHistory);
router.post('/redeem', validateJWT, redeemPoints);

export default router;

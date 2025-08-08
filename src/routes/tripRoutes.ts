// src/routes/tripRoutes.ts
import { Router } from 'express';
import * as tripController from '../controllers/tripController';
import { decodeFirebaseToken } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import {
  startTripSchema,
  updateTripSchema,
  tripIdParamSchema,
  nearbyPoisQuerySchema,
} from '../lib/validators/tripValidators';

const router = Router();

// All trip routes require a valid user token
router.use(decodeFirebaseToken);

// POST /v1/trip/start
router.post('/start', validate(startTripSchema), tripController.startTrip);

// PATCH /v1/trip/:id/update
router.patch('/:id/update', validate(updateTripSchema), tripController.updateTrip);

// GET /v1/trip/:id/nearby-pois
router.get('/:id/nearby-pois', validate(nearbyPoisQuerySchema), tripController.getNearbyPois);

// POST /v1/trip/:id/trigger-event
router.post('/:id/trigger-event', validate(tripIdParamSchema), tripController.triggerEvent);

export default router;

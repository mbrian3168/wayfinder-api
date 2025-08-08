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

/**
 * All trip routes require a valid Firebase user token.
 * (Middleware verifies and attaches req.user)
 */
router.use(decodeFirebaseToken);

/**
 * POST /v1/trip/start
 * Body: { origin: {lat,lng}, destination: {lat,lng}, host_id }
 */
router.post('/start', validate(startTripSchema), tripController.startTrip);

/**
 * PATCH /v1/trip/:id/update
 * Params: { id }
 * Body: { current_location?, eta_seconds? }
 */
router.patch('/:id/update', validate(updateTripSchema), tripController.updateTrip);

/**
 * GET /v1/trip/:id/nearby-pois
 * Params: { id }
 * Query: { latitude, longitude, radius_meters?, category? }
 */
router.get(
  '/:id/nearby-pois',
  validate(nearbyPoisQuerySchema),
  tripController.getNearbyPois
);

/**
 * POST /v1/trip/:id/trigger-event
 * Params: { id }
 * Body: { eventType, poiId }
 */
router.post(
  '/:id/trigger-event',
  validate(tripIdParamSchema),
  tripController.triggerEvent
);

export default router;

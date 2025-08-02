import { Router } from 'express';
import * as tripController from '../controllers/tripController';
import { decodeFirebaseToken } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { startTripSchema, updateTripSchema, tripIdParamSchema, nearbyPoisQuerySchema } from '../lib/validators/tripValidators';

const router = Router();

router.use(decodeFirebaseToken);

router.post('/start', validate(startTripSchema), tripController.startTrip);
router.patch('/:id/update', validate(updateTripSchema), tripController.updateTrip);
router.get('/nearby-pois', validate(nearbyPoisQuerySchema), tripController.getNearbyPois); // Note: No longer has :id
router.post('/:id/trigger-event', validate(tripIdParamSchema), tripController.triggerEvent);

export default router;

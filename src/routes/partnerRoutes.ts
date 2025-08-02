import { Router } from 'express';
import * as partnerController from '../controllers/partnerController';
import { verifyPartnerApiKey } from '../middleware/partnerAuthMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { createPoiSchema } from '../lib/validators/partnerValidators'; // Import the new schema

const router = Router();
router.use(verifyPartnerApiKey);

// Use the validation middleware for this route
router.post('/:id/poi', validate(createPoiSchema), partnerController.createPoi);

// Keep the other stubbed route for now
router.post('/:id/schedule-message', partnerController.scheduleMessage);

export default router;

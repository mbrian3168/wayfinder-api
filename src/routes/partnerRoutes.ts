import { Router } from 'express';
import * as partnerController from '../controllers/partnerController';
import { verifyPartnerApiKey } from '../middleware/partnerAuthMiddleware';

const router = Router();
router.use(verifyPartnerApiKey);

router.post('/:id/poi', partnerController.createPoi);
router.post('/:id/schedule-message', partnerController.scheduleMessage);

export default router;

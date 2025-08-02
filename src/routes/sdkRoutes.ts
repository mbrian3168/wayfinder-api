import { Router } from 'express';
import * as sdkController from '../controllers/sdkController';
import { decodeFirebaseToken } from '../middleware/authMiddleware';

const router = Router();
router.use(decodeFirebaseToken);

router.get('/init', sdkController.getSdkConfig);
router.post('/event-report', sdkController.reportEvent);

export default router;

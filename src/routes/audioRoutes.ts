import { Router } from 'express';
import * as audioController from '../controllers/audioController';
import { decodeFirebaseToken } from '../middleware/authMiddleware';

const router = Router();
router.use(decodeFirebaseToken);

router.get('/stream/:message_id', audioController.getAudioStream);
router.post('/generate', audioController.generateDynamicAudio);

export default router;

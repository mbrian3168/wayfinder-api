// src/routes/audioRoutes.ts
import { Router } from 'express';
import * as audioController from '../controllers/audioController';
import { decodeFirebaseToken } from '../middleware/authMiddleware';

const router = Router();

// All audio routes require Firebase authentication
router.use(decodeFirebaseToken);

/**
 * GET /v1/audio/stream/:message_id
 * Returns audio stream URL for a previously generated message
 */
router.get('/stream/:message_id', audioController.getAudioStream);

/**
 * POST /v1/audio/generate
 * Generate new audio from text using TTS
 */
router.post('/generate', audioController.generateDynamicAudio);

/**
 * POST /v1/audio/bulk-generate
 * Generate multiple audio files in batch
 */
router.post('/bulk-generate', audioController.bulkGenerateAudio);

/**
 * GET /v1/audio/voices
 * List available voices from TTS providers
 */
router.get('/voices', audioController.listVoices);

/**
 * POST /v1/audio/estimate-cost
 * Estimate cost for generating audio from given texts
 */
router.post('/estimate-cost', audioController.estimateCost);

export default router;

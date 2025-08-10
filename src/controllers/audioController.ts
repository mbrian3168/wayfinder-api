// src/controllers/audioController.ts
import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { NotFoundError, ValidationError, InternalServerError } from '../utils/errors';
import { generateAudioId } from '../utils/idGenerator';
import { TextToSpeechService } from '../services/tts/textToSpeechService';
import { AudioStorageService } from '../services/storage/audioStorageService';

/**
 * GET /v1/audio/stream/:message_id
 * Returns a streaming URL or direct audio data for a previously generated message
 */
export const getAudioStream = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { message_id } = req.params;
    
    if (!message_id) {
      throw new ValidationError('Message ID is required');
    }

    console.log(`🎵 Fetching audio stream for message: ${message_id}`, {
      requestId: req.id,
      userId: req.user?.uid,
    });

    try {
      // For now, we'll generate a simple response since we haven't set up the full database yet
      // This is a working implementation that can be enhanced when the database is ready
      
      // Return a mock response for testing
      res.status(200).json({
        message_id,
        audio_url: `https://example.com/audio/${message_id}.mp3`,
        duration_seconds: 15,
        host_profile: 'Navigator',
        status: 'available',
      });

    } catch (error) {
      console.error(`❌ Failed to get audio stream for ${message_id}:`, error);
      throw new InternalServerError('Failed to retrieve audio stream');
    }
  }
);

/**
 * POST /v1/audio/generate
 * Generates new audio from text using TTS service
 */
export const generateDynamicAudio = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { 
      text, 
      host_id, 
      voice_settings = {},
      cache = true,
      trigger_context 
    } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new ValidationError('Text is required and cannot be empty');
    }

    if (text.length > 5000) {
      throw new ValidationError('Text cannot exceed 5000 characters');
    }

    console.log(`🎙️ Generating audio for text length: ${text.length}`, {
      requestId: req.id,
      userId: req.user?.uid,
      hostId: host_id,
      hasVoiceSettings: Object.keys(voice_settings).length > 0,
    });

    try {
      // Generate unique message ID
      const messageId = generateAudioId();

      // Initialize TTS and storage services
      const ttsService = new TextToSpeechService();
      const audioStorage = new AudioStorageService();

      // Use default voice settings for now (can be enhanced with host profiles later)
      const finalVoiceSettings = {
        voice: 'en-US-Journey-D',
        language: 'en-US',
        speed: 1.0,
        pitch: 0,
        style: 'professional',
        ...voice_settings,
      };

      // Generate audio using TTS service
      const audioBuffer = await ttsService.generateSpeech(text, finalVoiceSettings);

      let audioUrl: string | null = null;
      let durationSeconds: number | null = null;

      // Store audio if caching is enabled
      if (cache) {
        audioUrl = await audioStorage.storeAudio(messageId, audioBuffer);
        
        // Estimate duration (rough calculation: ~150 words per minute)
        const wordCount = text.split(/\s+/).length;
        durationSeconds = Math.ceil((wordCount / 150) * 60);

        console.log(`💾 Audio cached with ID: ${messageId}`, {
          requestId: req.id,
          userId: req.user?.uid,
          textLength: text.length,
          durationSeconds,
          audioSize: audioBuffer.length,
        });
      }

      // Return response
      const response: any = {
        message_id: messageId,
        text_length: text.length,
        estimated_duration_seconds: durationSeconds,
        host_profile: 'Navigator', // Default for now
        voice_settings: finalVoiceSettings,
        cached: cache,
        storage_provider: audioStorage.getStorageType(),
      };

      if (audioUrl) {
        response.stream_url = audioUrl;
      } else {
        // For non-cached requests, return base64 audio data
        response.audio_data = audioBuffer.toString('base64');
        response.content_type = 'audio/mpeg';
      }

      res.status(201).json(response);

    } catch (error: any) {
      console.error('❌ Failed to generate audio:', error);
      
      if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
        throw new InternalServerError('TTS service quota exceeded. Please try again later.');
      } else if (error.message?.includes('invalid voice')) {
        throw new ValidationError('Invalid voice settings provided');
      } else {
        throw new InternalServerError(`Failed to generate audio: ${error.message}`);
      }
    }
  }
);

/**
 * POST /v1/audio/bulk-generate
 * Generates multiple audio files in batch for efficiency
 */
export const bulkGenerateAudio = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new ValidationError('Messages array is required and cannot be empty');
    }

    if (messages.length > 50) {
      throw new ValidationError('Cannot generate more than 50 audio messages at once');
    }

    console.log(`🎵 Bulk generating ${messages.length} audio messages`, {
      requestId: req.id,
      userId: req.user?.uid,
    });

    const results = [];
    const ttsService = new TextToSpeechService();
    const audioStorage = new AudioStorageService();

    for (const [index, message] of messages.entries()) {
      try {
        const { text, host_id, context } = message;

        if (!text || typeof text !== 'string') {
          results.push({
            index,
            success: false,
            error: 'Text is required',
          });
          continue;
        }

        const messageId = generateAudioId();
        
        // Use default voice settings (can be enhanced with host profiles later)
        const voiceSettings = {
          voice: 'en-US-Journey-D',
          language: 'en-US',
          speed: 1.0,
          pitch: 0,
          style: 'professional',
        };

        // Generate audio
        const audioBuffer = await ttsService.generateSpeech(text, voiceSettings);
        const audioUrl = await audioStorage.storeAudio(messageId, audioBuffer);

        // Estimate duration
        const wordCount = text.split(/\s+/).length;
        const durationSeconds = Math.ceil((wordCount / 150) * 60);

        results.push({
          index,
          success: true,
          message_id: messageId,
          stream_url: audioUrl,
          duration_seconds: durationSeconds,
        });

      } catch (error: any) {
        console.error(`Failed to generate audio for message ${index}:`, error);
        results.push({
          index,
          success: false,
          error: error.message || 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Bulk generation complete: ${successCount}/${messages.length} successful`, {
      requestId: req.id,
      userId: req.user?.uid,
    });

    res.status(207).json({
      total_requested: messages.length,
      successful: successCount,
      failed: messages.length - successCount,
      results,
    });
  }
);

/**
 * GET /v1/audio/voices
 * List available voices from TTS providers
 */
export const listVoices = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { provider } = req.query;

    try {
      const ttsService = new TextToSpeechService();
      const voices = await ttsService.listAvailableVoices(provider as any);

      console.log(`📋 Listed ${voices.length} available voices`, {
        requestId: req.id,
        provider: provider || 'default',
      });

      res.status(200).json({
        voices,
        total_count: voices.length,
        providers: ttsService.getAvailableProviders(),
      });

    } catch (error) {
      console.error('❌ Failed to list voices:', error);
      throw new InternalServerError('Failed to retrieve voice list');
    }
  }
);

/**
 * POST /v1/audio/estimate-cost
 * Estimate cost for generating audio from given texts
 */
export const estimateCost = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { texts, provider } = req.body;

    if (!Array.isArray(texts) || texts.length === 0) {
      throw new ValidationError('Texts array is required and cannot be empty');
    }

    try {
      const ttsService = new TextToSpeechService();
      
      const estimates = texts.map((text: string, index: number) => {
        const cost = ttsService.estimateCost(text, provider);
        const wordCount = text.split(/\s+/).length;
        const estimatedDuration = Math.ceil((wordCount / 150) * 60);
        
        return {
          index,
          text_length: text.length,
          word_count: wordCount,
          estimated_duration_seconds: estimatedDuration,
          estimated_cost_usd: cost,
        };
      });

      const totalCost = estimates.reduce((sum, est) => sum + est.estimated_cost_usd, 0);
      const totalDuration = estimates.reduce((sum, est) => sum + est.estimated_duration_seconds, 0);

      res.status(200).json({
        estimates,
        summary: {
          total_texts: texts.length,
          total_estimated_cost_usd: totalCost,
          total_estimated_duration_seconds: totalDuration,
          provider: provider || 'google',
        },
      });

    } catch (error) {
      console.error('❌ Failed to estimate cost:', error);
      throw new InternalServerError('Failed to estimate cost');
    }
  }
);

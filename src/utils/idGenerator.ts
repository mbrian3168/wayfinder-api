// src/utils/idGenerator.ts
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

/**
 * Generate a unique audio message ID
 * Format: audio_[timestamp]_[shortUuid]
 */
export function generateAudioId(): string {
  const timestamp = Date.now();
  const shortUuid = uuidv4().split('-')[0];
  return `audio_${timestamp}_${shortUuid}`;
}

/**
 * Generate a secure hash for audio content deduplication
 */
export function generateContentHash(text: string, voiceSettings: object): string {
  const content = JSON.stringify({ text: text.trim(), settings: voiceSettings });
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

/**
 * Validate audio message ID format
 */
export function isValidAudioId(id: string): boolean {
  return /^audio_\d+_[a-f0-9]{8}$/.test(id);
}

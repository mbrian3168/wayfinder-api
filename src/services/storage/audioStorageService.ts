// src/services/storage/audioStorageService.ts
import { env } from '../../config/environment';
import path from 'path';

export type StorageProvider = 'firebase' | 'vercel-blob' | 'local';

export interface StorageProviderInterface {
  storeAudio(messageId: string, audioBuffer: Buffer): Promise<string>;
  getAudioUrl(messageId: string): Promise<string | null>;
  deleteAudio(messageId: string): Promise<void>;
  exists(messageId: string): Promise<boolean>;
}

export class AudioStorageService {
  private provider: StorageProviderInterface;
  private storageType: StorageProvider;

  constructor() {
    this.storageType = this.determineStorageProvider();
    this.provider = this.initializeProvider();
  }

  private determineStorageProvider(): StorageProvider {
    // Priority order: Vercel Blob (if on Vercel), Firebase, Local
    if (process.env.VERCEL && env.BLOB_READ_WRITE_TOKEN) {
      return 'vercel-blob';
    } else if (env.GOOGLE_CLOUD_PROJECT_ID || env.FIREBASE_PROJECT_ID) {
      return 'firebase';
    } else {
      return 'local';
    }
  }

  private initializeProvider(): StorageProviderInterface {
    switch (this.storageType) {
      case 'vercel-blob':
        return new VercelBlobProvider();
      case 'firebase':
        return new FirebaseStorageProvider();
      case 'local':
        return new LocalStorageProvider();
      default:
        throw new Error(`Unsupported storage provider: ${this.storageType}`);
    }
  }

  async storeAudio(messageId: string, audioBuffer: Buffer): Promise<string> {
    console.log(`💾 Storing audio with ${this.storageType} provider`, {
      messageId,
      size: audioBuffer.length,
    });

    try {
      const url = await this.provider.storeAudio(messageId, audioBuffer);
      console.log(`✅ Audio stored successfully: ${messageId}`, { url });
      return url;
    } catch (error: any) {
      console.error(`❌ Failed to store audio with ${this.storageType}:`, error);
      throw new Error(`Storage failed: ${error.message}`);
    }
  }

  async getAudioUrl(messageId: string): Promise<string | null> {
    try {
      return await this.provider.getAudioUrl(messageId);
    } catch (error: any) {
      console.error(`❌ Failed to get audio URL with ${this.storageType}:`, error);
      return null;
    }
  }

  async deleteAudio(messageId: string): Promise<void> {
    try {
      await this.provider.deleteAudio(messageId);
      console.log(`🗑️ Audio deleted: ${messageId}`);
    } catch (error: any) {
      console.error(`❌ Failed to delete audio with ${this.storageType}:`, error);
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  async exists(messageId: string): Promise<boolean> {
    try {
      return await this.provider.exists(messageId);
    } catch (error: any) {
      console.error(`❌ Failed to check audio existence with ${this.storageType}:`, error);
      return false;
    }
  }

  getStorageType(): StorageProvider {
    return this.storageType;
  }
}

// Vercel Blob Storage Provider (Recommended for Vercel deployments)
class VercelBlobProvider implements StorageProviderInterface {
  private basePath = 'wayfinder-audio';

  async storeAudio(messageId: string, audioBuffer: Buffer): Promise<string> {
    const { put } = await import('@vercel/blob');
    
    const filename = `${this.basePath}/${messageId}.mp3`;
    const blob = await put(filename, audioBuffer, {
      access: 'public',
      contentType: 'audio/mpeg',
    });

    return blob.url;
  }

  async getAudioUrl(messageId: string): Promise<string | null> {
    const { head } = await import('@vercel/blob');
    
    try {
      const filename = `${this.basePath}/${messageId}.mp3`;
      const blob = await head(filename);
      return blob.url;
    } catch (error) {
      return null; // File doesn't exist
    }
  }

  async deleteAudio(messageId: string): Promise<void> {
    const { del } = await import('@vercel/blob');
    
    const filename = `${this.basePath}/${messageId}.mp3`;
    await del(filename);
  }

  async exists(messageId: string): Promise<boolean> {
    return (await this.getAudioUrl(messageId)) !== null;
  }
}

// Firebase Storage Provider
class FirebaseStorageProvider implements StorageProviderInterface {
  private bucket: any;
  private basePath = 'wayfinder-audio';

  constructor() {
    this.initializeBucket();
  }

  private async initializeBucket() {
    try {
      const admin = await import('firebase-admin');
      if (!admin.apps.length) {
        // Firebase should already be initialized in your app
        throw new Error('Firebase Admin not initialized');
      }
      this.bucket = admin.storage().bucket();
    } catch (error) {
      console.error('Failed to initialize Firebase Storage:', error);
      throw error;
    }
  }

  async storeAudio(messageId: string, audioBuffer: Buffer): Promise<string> {
    if (!this.bucket) await this.initializeBucket();

    const filename = `${this.basePath}/${messageId}.mp3`;
    const file = this.bucket.file(filename);

    await file.save(audioBuffer, {
      metadata: {
        contentType: 'audio/mpeg',
        cacheControl: 'public, max-age=31536000', // 1 year cache
      },
    });

    // Make file publicly accessible
    await file.makePublic();

    // Return public URL
    return `https://storage.googleapis.com/${this.bucket.name}/${filename}`;
  }

  async getAudioUrl(messageId: string): Promise<string | null> {
    if (!this.bucket) await this.initializeBucket();

    const filename = `${this.basePath}/${messageId}.mp3`;
    const file = this.bucket.file(filename);

    try {
      const [exists] = await file.exists();
      if (!exists) return null;
      
      return `https://storage.googleapis.com/${this.bucket.name}/${filename}`;
    } catch (error) {
      return null;
    }
  }

  async deleteAudio(messageId: string): Promise<void> {
    if (!this.bucket) await this.initializeBucket();

    const filename = `${this.basePath}/${messageId}.mp3`;
    const file = this.bucket.file(filename);
    await file.delete();
  }

  async exists(messageId: string): Promise<boolean> {
    return (await this.getAudioUrl(messageId)) !== null;
  }
}

// Local Storage Provider (Development only)
class LocalStorageProvider implements StorageProviderInterface {
  private storageDir: string;

  constructor() {
    this.storageDir = env.LOCAL_AUDIO_STORAGE || './storage/audio';
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    const fs = require('fs');
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  async storeAudio(messageId: string, audioBuffer: Buffer): Promise<string> {
    const fs = require('fs').promises;
    const filePath = path.join(this.storageDir, `${messageId}.mp3`);
    
    await fs.writeFile(filePath, audioBuffer);
    
    // Return local URL (assumes you're serving static files)
    const baseUrl = env.BASE_URL || 'http://localhost:8080';
    return `${baseUrl}/audio/${messageId}.mp3`;
  }

  async getAudioUrl(messageId: string): Promise<string | null> {
    const fs = require('fs');
    const filePath = path.join(this.storageDir, `${messageId}.mp3`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const baseUrl = env.BASE_URL || 'http://localhost:8080';
    return `${baseUrl}/audio/${messageId}.mp3`;
  }

  async deleteAudio(messageId: string): Promise<void> {
    const fs = require('fs').promises;
    const filePath = path.join(this.storageDir, `${messageId}.mp3`);
    
    try {
      await fs.unlink(filePath);
    } catch (error: any) {
      // File might not exist, which is fine
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async exists(messageId: string): Promise<boolean> {
    const fs = require('fs');
    const filePath = path.join(this.storageDir, `${messageId}.mp3`);
    return fs.existsSync(filePath);
  }
}

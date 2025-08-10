// src/services/tts/textToSpeechService.ts
import { env } from '../../config/environment';
import { GoogleTTSProvider } from './providers/googleTTSProvider';

export type TTSProvider = 'google' | 'elevenlabs' | 'azure' | 'aws-polly';

export interface VoiceSettings {
  voice?: string;
  language?: string;
  speed?: number;
  pitch?: number;
  volume?: number;
  style?: string;
  stability?: number;
  clarity?: number;
  provider?: TTSProvider;
}

export interface TTSProviderInterface {
  generateSpeech(text: string, settings: VoiceSettings): Promise<Buffer>;
  listVoices(): Promise<Array<{ id: string; name: string; language: string }>>;
  estimateCost(text: string): number;
}

export class TextToSpeechService {
  private providers: Map<TTSProvider, TTSProviderInterface> = new Map();
  private defaultProvider: TTSProvider;

  constructor() {
    this.defaultProvider = (env.TTS_DEFAULT_PROVIDER as TTSProvider) || 'google';
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize Google Cloud Text-to-Speech (most reliable, good quality)
    if (env.GOOGLE_CLOUD_PROJECT_ID || env.FIREBASE_PROJECT_ID) {
      this.providers.set('google', new GoogleTTSProvider());
    }

    // Fallback to Google if no providers available
    if (this.providers.size === 0) {
      console.warn('⚠️ No TTS providers configured, falling back to Google');
      this.providers.set('google', new GoogleTTSProvider());
    }

    console.log(`🎙️ TTS Service initialized with providers: ${Array.from(this.providers.keys()).join(', ')}`);
  }

  async generateSpeech(text: string, settings: VoiceSettings = {}): Promise<Buffer> {
    const provider = settings.provider || this.defaultProvider;
    const ttsProvider = this.providers.get(provider);

    if (!ttsProvider) {
      throw new Error(`TTS provider '${provider}' not available. Available providers: ${Array.from(this.providers.keys()).join(', ')}`);
    }

    try {
      console.log(`🎵 Generating speech with ${provider}`, {
        textLength: text.length,
        voice: settings.voice,
        language: settings.language,
      });

      const audioBuffer = await ttsProvider.generateSpeech(text, settings);
      
      console.log(`✅ Speech generated successfully with ${provider}`, {
        audioSize: audioBuffer.length,
        textLength: text.length,
      });

      return audioBuffer;
    } catch (error: any) {
      console.error(`❌ Failed to generate speech with ${provider}:`, error);
      
      // Try fallback provider if available
      if (provider !== 'google' && this.providers.has('google')) {
        console.log('🔄 Attempting fallback to Google TTS');
        const googleProvider = this.providers.get('google')!;
        return await googleProvider.generateSpeech(text, { ...settings, provider: 'google' });
      }
      
      throw new Error(`TTS generation failed: ${error.message}`);
    }
  }

  async listAvailableVoices(provider?: TTSProvider): Promise<Array<{ id: string; name: string; language: string; provider: string }>> {
    const targetProvider = provider || this.defaultProvider;
    const ttsProvider = this.providers.get(targetProvider);

    if (!ttsProvider) {
      throw new Error(`TTS provider '${targetProvider}' not available`);
    }

    const voices = await ttsProvider.listVoices();
    return voices.map(voice => ({ ...voice, provider: targetProvider }));
  }

  estimateCost(text: string, provider?: TTSProvider): number {
    const targetProvider = provider || this.defaultProvider;
    const ttsProvider = this.providers.get(targetProvider);

    if (!ttsProvider) {
      return 0;
    }

    return ttsProvider.estimateCost(text);
  }

  getAvailableProviders(): TTSProvider[] {
    return Array.from(this.providers.keys());
  }

  isProviderAvailable(provider: TTSProvider): boolean {
    return this.providers.has(provider);
  }
}

// Utility functions for voice management
export class VoiceManager {
  private static defaultVoices: Record<string, VoiceSettings> = {
    'navigator': {
      voice: 'en-US-Journey-D',
      language: 'en-US',
      speed: 1.0,
      pitch: 0,
      style: 'professional',
    },
    'friendly_host': {
      voice: 'en-US-Journey-F',
      language: 'en-US',
      speed: 0.9,
      pitch: 2,
      style: 'friendly',
    },
    'adventure_guide': {
      voice: 'en-US-Studio-O',
      language: 'en-US',
      speed: 1.1,
      pitch: 1,
      style: 'excited',
    },
    'historian': {
      voice: 'en-US-Studio-Q',
      language: 'en-US',
      speed: 0.8,
      pitch: -1,
      style: 'authoritative',
    },
  };

  static getVoiceSettings(hostType: string): VoiceSettings {
    return this.defaultVoices[hostType] || this.defaultVoices['navigator'];
  }

  static getAllHostTypes(): string[] {
    return Object.keys(this.defaultVoices);
  }

  static customizeVoice(baseType: string, overrides: Partial<VoiceSettings>): VoiceSettings {
    const baseSettings = this.getVoiceSettings(baseType);
    return { ...baseSettings, ...overrides };
  }
}

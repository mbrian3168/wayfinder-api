// src/services/tts/providers/googleTTSProvider.ts
import { TTSProviderInterface, VoiceSettings } from '../textToSpeechService';
import { env } from '../../../config/environment';

interface GoogleVoice {
  name: string;
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  languageCodes: string[];
  naturalSampleRateHertz: number;
}

export class GoogleTTSProvider implements TTSProviderInterface {
  private projectId: string;
  private credentials: any;

  constructor() {
    this.projectId = env.GOOGLE_CLOUD_PROJECT_ID || env.FIREBASE_PROJECT_ID || 'wayfinder-8748d';
    
    if (!this.projectId) {
      throw new Error('Google Cloud Project ID is required for Google TTS');
    }

    // Use Firebase credentials if available
    if (env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      try {
        const serviceAccount = JSON.parse(Buffer.from(env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString());
        this.credentials = serviceAccount;
      } catch (error) {
        console.error('Failed to parse Firebase service account:', error);
      }
    }
  }

  async generateSpeech(text: string, settings: VoiceSettings): Promise<Buffer> {
    try {
      // Import Google TTS client
      const textToSpeech = await this.getTextToSpeechClient();

      // Prepare the request
      const request = {
        input: { text: this.preprocessText(text) },
        voice: {
          languageCode: settings.language || 'en-US',
          name: settings.voice || 'en-US-Journey-D',
          ssmlGender: this.getGenderFromVoice(settings.voice),
        },
        audioConfig: {
          audioEncoding: 'MP3' as const,
          speakingRate: settings.speed || 1.0,
          pitch: settings.pitch || 0,
          volumeGainDb: settings.volume || 0,
          effectsProfileId: settings.style ? [this.getAudioProfile(settings.style)] : undefined,
        },
      };

      console.log(`🎙️ Google TTS request:`, {
        textLength: text.length,
        voice: request.voice.name,
        language: request.voice.languageCode,
        speakingRate: request.audioConfig.speakingRate,
      });

      // Generate speech
      const [response] = await textToSpeech.synthesizeSpeech(request);
      
      if (!response.audioContent) {
        throw new Error('No audio content received from Google TTS');
      }

      return Buffer.from(response.audioContent);

    } catch (error: any) {
      console.error('❌ Google TTS error:', error);
      
      if (error.code === 'PERMISSION_DENIED') {
        throw new Error('Google TTS permission denied. Check service account credentials.');
      } else if (error.code === 'QUOTA_EXCEEDED') {
        throw new Error('Google TTS quota exceeded. Please check your usage limits.');
      } else if (error.code === 'INVALID_ARGUMENT') {
        throw new Error('Invalid voice settings provided to Google TTS.');
      }
      
      throw new Error(`Google TTS failed: ${error.message}`);
    }
  }

  async listVoices(): Promise<Array<{ id: string; name: string; language: string }>> {
    try {
      const textToSpeech = await this.getTextToSpeechClient();
      const [response] = await textToSpeech.listVoices({});

      if (!response.voices) {
        return this.getDefaultVoices();
      }

      return response.voices.map((voice: any) => ({
        id: voice.name || 'unknown',
        name: this.formatVoiceName(voice.name || 'unknown'),
        language: voice.languageCodes?.[0] || 'en-US',
      }));

    } catch (error: any) {
      console.error('❌ Failed to list Google TTS voices:', error);
      return this.getDefaultVoices();
    }
  }

  estimateCost(text: string): number {
    // Google TTS pricing: $4.00 per 1 million characters for Standard voices
    // $16.00 per 1 million characters for WaveNet/Journey voices
    const characterCount = text.length;
    const isWaveNetVoice = true; // Assume premium voices
    const pricePerChar = isWaveNetVoice ? 16 / 1000000 : 4 / 1000000;
    return characterCount * pricePerChar;
  }

  private async getTextToSpeechClient() {
    // Dynamic import to avoid bundling issues
    const { TextToSpeechClient } = await import('@google-cloud/text-to-speech');
    
    if (this.credentials) {
      return new TextToSpeechClient({
        credentials: this.credentials,
        projectId: this.projectId,
      });
    } else {
      // Use default credentials (works in Google Cloud environments)
      return new TextToSpeechClient({
        projectId: this.projectId,
      });
    }
  }

  private preprocessText(text: string): string {
    // Clean up text for better TTS pronunciation
    return text
      .replace(/&/g, 'and')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private getGenderFromVoice(voice?: string): 'MALE' | 'FEMALE' | 'NEUTRAL' {
    if (!voice) return 'NEUTRAL';
    
    // Google's voice naming conventions
    if (voice.includes('-A') || voice.includes('-C') || voice.includes('-E')) return 'FEMALE';
    if (voice.includes('-B') || voice.includes('-D') || voice.includes('-F')) return 'MALE';
    return 'NEUTRAL';
  }

  private getAudioProfile(style: string): string {
    const profiles: Record<string, string> = {
      'professional': 'handset-class-device',
      'friendly': 'wearable-class-device',
      'excited': 'handset-class-device',
      'authoritative': 'telephony-class-application',
      'casual': 'wearable-class-device',
    };
    return profiles[style] || 'handset-class-device';
  }

  private formatVoiceName(voiceName: string): string {
    // Convert "en-US-Journey-D" to "Journey D (US English)"
    const parts = voiceName.split('-');
    if (parts.length >= 3) {
      const language = parts.slice(0, 2).join('-');
      const voice = parts.slice(2).join(' ');
      return `${voice} (${this.getLanguageDisplayName(language)})`;
    }
    return voiceName;
  }

  private getLanguageDisplayName(code: string): string {
    const languages: Record<string, string> = {
      'en-US': 'US English',
      'en-GB': 'British English',
      'en-AU': 'Australian English',
      'es-ES': 'Spanish (Spain)',
      'es-US': 'Spanish (US)',
      'fr-FR': 'French',
      'de-DE': 'German',
      'it-IT': 'Italian',
      'ja-JP': 'Japanese',
      'ko-KR': 'Korean',
      'zh-CN': 'Chinese (Mandarin)',
    };
    return languages[code] || code;
  }

  private getDefaultVoices(): Array<{ id: string; name: string; language: string }> {
    // Fallback voices if API call fails
    return [
      { id: 'en-US-Journey-D', name: 'Journey D (US English)', language: 'en-US' },
      { id: 'en-US-Journey-F', name: 'Journey F (US English)', language: 'en-US' },
      { id: 'en-US-Studio-O', name: 'Studio O (US English)', language: 'en-US' },
      { id: 'en-US-Studio-Q', name: 'Studio Q (US English)', language: 'en-US' },
      { id: 'en-GB-Journey-D', name: 'Journey D (British English)', language: 'en-GB' },
      { id: 'en-GB-Journey-F', name: 'Journey F (British English)', language: 'en-GB' },
    ];
  }
}

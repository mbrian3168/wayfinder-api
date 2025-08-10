// scripts/test-audio-generation.ts
// Simple test script to verify TTS is working

import { TextToSpeechService, VoiceSettings } from '../src/services/tts/textToSpeechService';
import { AudioStorageService } from '../src/services/storage/audioStorageService';
import { generateAudioId } from '../src/utils/idGenerator';

async function testAudioGeneration() {
  console.log('🧪 Testing audio generation...');
  
  try {
    // Test TTS service
    const ttsService = new TextToSpeechService();
    const audioStorage = new AudioStorageService();
    
    const testText = "Hello! This is a test of the Wayfinder audio generation system.";
    const voiceSettings: VoiceSettings = {
      voice: 'en-US-Journey-D',
      language: 'en-US',
      speed: 1.0,
    };
    
    console.log('📝 Test text:', testText);
    console.log('🎙️ Voice settings:', voiceSettings);
    
    // Generate audio
    console.log('🎵 Generating audio...');
    const audioBuffer = await ttsService.generateSpeech(testText, voiceSettings);
    console.log(`✅ Audio generated! Size: ${audioBuffer.length} bytes`);
    
    // Test storage
    const messageId = generateAudioId();
    console.log('💾 Storing audio with ID:', messageId);
    const audioUrl = await audioStorage.storeAudio(messageId, audioBuffer);
    console.log('✅ Audio stored at:', audioUrl);
    
    // Test retrieval
    console.log('🔍 Testing audio retrieval...');
    const retrievedUrl = await audioStorage.getAudioUrl(messageId);
    console.log('✅ Retrieved URL:', retrievedUrl);
    
    // List available voices
    console.log('📋 Listing available voices...');
    const voices = await ttsService.listAvailableVoices();
    console.log(`✅ Found ${voices.length} voices`);
    console.log('Sample voices:', voices.slice(0, 3));
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error.message?.includes('PERMISSION_DENIED')) {
      console.log('\n💡 This might be a credentials issue. Make sure your Firebase service account has the necessary permissions for Google Cloud Text-to-Speech.');
    } else if (error.message?.includes('PROJECT_ID')) {
      console.log('\n💡 Make sure GOOGLE_CLOUD_PROJECT_ID is set in your .env file.');
    }
    
    process.exit(1);
  }
}

if (require.main === module) {
  testAudioGeneration();
}

export { testAudioGeneration };

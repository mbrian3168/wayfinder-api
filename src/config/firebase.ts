import admin from 'firebase-admin';

export const initializeFirebase = () => {
  if (admin.apps.length) return;

  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is required');
    }

    let serviceAccountJson: string;
    try {
      serviceAccountJson = Buffer.from(
        process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
        'base64'
      ).toString('utf8');
      
      // Clean up any potential control characters but preserve newlines in private key
      serviceAccountJson = serviceAccountJson.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      
    } catch (decodeError) {
      console.error('❌ Failed to decode Firebase service account base64:', decodeError);
      throw new Error('Invalid Firebase service account base64 encoding');
    }
    
    let serviceAccount: any;
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch (parseError) {
      console.error('❌ Failed to parse Firebase service account JSON:', parseError);
      console.error('Decoded content preview:', serviceAccountJson.substring(0, 100) + '...');
      throw new Error('Invalid Firebase service account JSON format');
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('🔥 Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    throw new Error('Firebase initialization failed');
  }
};

import { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/app';

// Export the Express app as a Vercel serverless function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Add Vercel-specific headers for CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-api-key, x-request-id');
    res.setHeader('Access-Control-Max-Age', '86400');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Trust proxy for Vercel
    app.set('trust proxy', 1);

    // Handle the request with the Express app
    return app(req, res);
  } catch (error: any) {
    console.error('Vercel serverless function error:', error);
    return res.status(500).json({ 
      error: {
        message: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString(),
        service: 'Wayfinder API',
        version: '9.0.0'
      }
    });
  }
}

import { VercelRequest, VercelResponse } from '@vercel/node';

// Simple health check function for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Simple routing for basic endpoints
    const { url, method } = req;
    
    if (url === '/' || url === '') {
      return res.status(200).json({
        message: '🧭 Wayfinder API',
        status: 'online',
        version: '9.0.0',
        environment: 'production',
        endpoints: {
          health: '/v1/health',
          docs: '/v1/docs',
          api: '/v1'
        }
      });
    }
    
    if (url === '/v1/health') {
      return res.status(200).json({
        ok: true,
        service: 'Wayfinder API',
        version: 'v1',
        environment: process.env.NODE_ENV || 'production',
        timestamp: new Date().toISOString(),
        database: 'checking...'
      });
    }
    
    if (url === '/v1') {
      return res.status(200).json({
        service: 'Wayfinder API',
        version: 'v1',
        status: 'online',
        endpoints: {
          public: {
            index: '/v1',
            health: '/v1/health',
            status: '/v1/status'
          },
          trip: {
            start: 'POST /v1/trip/start',
            update: 'PATCH /v1/trip/:id/update',
            nearbyPois: 'GET /v1/trip/:id/nearby-pois',
            triggerEvent: 'POST /v1/trip/:id/trigger-event'
          }
        }
      });
    }

    // For other routes, return a simplified response
    return res.status(200).json({
      message: 'Wayfinder API is online',
      path: url,
      method: method,
      note: 'Full API functionality coming soon'
    });

  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      note: 'API is being deployed'
    });
  }
}

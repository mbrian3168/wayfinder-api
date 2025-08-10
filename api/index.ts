import { VercelRequest, VercelResponse } from '@vercel/node';

// Simple health check function for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set comprehensive CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-api-key');
    res.setHeader('Access-Control-Max-Age', '86400');

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
        cors: 'enabled',
        timestamp: new Date().toISOString(),
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
        database: 'simulated - ok',
        cors: 'enabled',
        requestMethod: method,
        headers: {
          origin: req.headers.origin || 'none',
          userAgent: req.headers['user-agent'] || 'unknown'
        }
      });
    }
    
    if (url === '/v1/status') {
      return res.status(200).json({
        ok: true,
        service: 'Wayfinder API',
        version: 'v1',
        node: process.version,
        environment: process.env.NODE_ENV || 'production',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        cors: 'enabled',
        env: {
          vercel: !!process.env.VERCEL,
          region: process.env.VERCEL_REGION || null
        }
      });
    }
    
    if (url === '/v1') {
      return res.status(200).json({
        service: 'Wayfinder API',
        version: 'v1',
        status: 'online',
        cors: 'enabled',
        timestamp: new Date().toISOString(),
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
          },
          partner: {
            createPoi: 'POST /v1/partner/:id/poi',
            scheduleMessage: 'POST /v1/partner/:id/schedule-message'
          }
        },
        repo: 'https://github.com/mbrian3168/wayfinder-api'
      });
    }

    // Test authentication for trip endpoints
    if (url?.startsWith('/v1/trip/')) {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({
          error: {
            message: 'Authorization header is required',
            code: 'UNAUTHORIZED',
            timestamp: new Date().toISOString()
          }
        });
      }
      
      // Simulate trip endpoint response
      return res.status(200).json({
        message: 'Trip endpoint reached successfully',
        path: url,
        method: method,
        authentication: 'verified',
        note: 'This is a simulated response - full functionality will be added with database integration',
        timestamp: new Date().toISOString()
      });
    }

    // Test partner API key for partner endpoints
    if (url?.startsWith('/v1/partner/')) {
      const apiKey = req.headers['x-api-key'];
      if (!apiKey) {
        return res.status(401).json({
          error: {
            message: 'API key is required in x-api-key header',
            code: 'UNAUTHORIZED',
            timestamp: new Date().toISOString()
          }
        });
      }
      
      // Simulate partner endpoint response
      return res.status(200).json({
        message: 'Partner endpoint reached successfully',
        path: url,
        method: method,
        authentication: 'verified',
        note: 'This is a simulated response - full functionality will be added with database integration',
        timestamp: new Date().toISOString()
      });
    }

    // For other routes, return a helpful response
    return res.status(200).json({
      message: 'Wayfinder API is online',
      path: url,
      method: method,
      cors: 'enabled',
      note: 'API endpoint not yet implemented',
      timestamp: new Date().toISOString(),
      availableEndpoints: ['/v1', '/v1/health', '/v1/status']
    });

  } catch (error: any) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ 
      error: {
        message: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
}

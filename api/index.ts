import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

    // Simple routing
    const { url } = req;
    
    if (url === '/' || url === '') {
      return res.status(200).json({
        service: 'Wayfinder API',
        version: '9.0.0',
        status: 'online',
        timestamp: new Date().toISOString(),
        environment: 'vercel-production',
        message: 'Basic serverless function is working'
      });
    }

    if (url === '/v1') {
      return res.status(200).json({
        service: 'Wayfinder API',
        version: 'v1',
        status: 'operational',
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/v1/health',
          status: '/v1/status'
        }
      });
    }

    if (url === '/v1/health') {
      return res.status(200).json({
        ok: true,
        service: 'Wayfinder API',
        version: 'v1',
        database: 'simulated-ok',
        timestamp: new Date().toISOString(),
        note: 'Simplified function for debugging'
      });
    }

    if (url === '/v1/status') {
      return res.status(200).json({
        ok: true,
        service: 'Wayfinder API',
        version: 'v1',
        node: process.version,
        environment: process.env.NODE_ENV || 'production',
        vercel: !!process.env.VERCEL,
        timestamp: new Date().toISOString()
      });
    }

    if (url === '/v1/docs') {
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Wayfinder API Docs</title></head>
          <body>
            <h1>🧭 Wayfinder API</h1>
            <p>API Documentation placeholder</p>
            <ul>
              <li><a href="/v1/health">Health Check</a></li>
              <li><a href="/v1/status">Status</a></li>
            </ul>
          </body>
        </html>
      `);
    }

    // Handle authentication-required routes
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
    }

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
    }

    // Default response for any other route
    return res.status(200).json({
      message: 'Wayfinder API is operational',
      path: url,
      method: req.method,
      timestamp: new Date().toISOString(),
      note: 'Route not specifically handled yet'
    });

  } catch (error: any) {
    console.error('Serverless function error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}

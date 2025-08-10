import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import { requestId } from '../src/middleware/requestId';
import { errorHandler } from '../src/middleware/errorHandler';
import { generalLimiter, authLimiter, tripCreationLimiter, partnerLimiter } from '../src/middleware/rateLimiter';
import { initializeFirebase } from '../src/config/firebase';
import { env } from '../src/config/environment';

// Import routes
import tripRoutes from '../src/routes/tripRoutes';
import partnerRoutes from '../src/routes/partnerRoutes';
import audioRoutes from '../src/routes/audioRoutes';
import sdkRoutes from '../src/routes/sdkRoutes';

// Initialize Firebase (idempotent)
initializeFirebase();

// Create Express app for serverless
const createApp = () => {
  const app = express();

  // Trust proxy for Vercel
  app.set('trust proxy', 1);

  // Global middleware
  app.use(requestId);
  app.use(generalLimiter);

  // CORS configuration
  const corsOptions = {
    origin: env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()),
    credentials: true,
    optionsSuccessStatus: 200,
  };
  app.use(cors(corsOptions));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Public endpoints
  app.get('/', (_req, res) => {
    res.status(200).json({
      service: 'Wayfinder API',
      version: '9.0.0',
      status: 'online',
      environment: 'production',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/v1/health',
        docs: '/v1/docs',
        api: '/v1'
      }
    });
  });

  app.get('/v1', (_req, res) => {
    res.status(200).json({
      service: 'Wayfinder API',
      version: 'v1',
      endpoints: {
        public: {
          index: '/v1',
          health: '/v1/health',
          status: '/v1/status',
          docs: '/v1/docs',
          openapi: '/v1/openapi.yaml'
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
        },
        audio: {
          stream: 'GET /v1/audio/stream/:message_id',
          generate: 'POST /v1/audio/generate'
        },
        sdk: {
          init: 'GET /v1/sdk/init',
          eventReport: 'POST /v1/sdk/event-report'
        }
      }
    });
  });

  app.get('/v1/health', async (_req, res) => {
    try {
      // Test database connectivity
      const prisma = (await import('../src/config/prisma')).default;
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ 
        ok: true, 
        service: 'Wayfinder API', 
        version: 'v1',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(503).json({ 
        ok: false, 
        service: 'Wayfinder API', 
        version: 'v1',
        database: 'disconnected',
        timestamp: new Date().toISOString()
      });
    }
  });

  app.get('/v1/status', (_req, res) => {
    res.status(200).json({
      ok: true,
      service: 'Wayfinder API',
      version: 'v1',
      node: process.version,
      env: {
        vercel: !!process.env.VERCEL,
        region: process.env.VERCEL_REGION || null,
        environment: process.env.NODE_ENV || 'production'
      },
      uptime_seconds: process.uptime()
    });
  });

  // Serve OpenAPI docs
  app.get('/v1/docs', (_req, res) => {
    res.status(200).type('html').send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Wayfinder API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>body { margin: 0; } #swagger-ui { max-width: 1100px; margin: 0 auto; }</style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: '/v1/openapi.yaml',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis],
          layout: 'BaseLayout'
        });
      };
    </script>
  </body>
</html>`);
  });

  // Protected routes with rate limiting
  app.use('/v1/trip/start', tripCreationLimiter);
  app.use('/v1/trip', authLimiter, tripRoutes);
  app.use('/v1/partner', partnerLimiter, partnerRoutes);
  app.use('/v1/audio', authLimiter, audioRoutes);
  app.use('/v1/sdk', authLimiter, sdkRoutes);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      error: {
        message: `Route ${req.method} ${req.originalUrl} not found`,
        code: 'ROUTE_NOT_FOUND',
        timestamp: new Date().toISOString(),
      },
    });
  });

  // Error handler
  app.use(errorHandler);

  return app;
};

// Export the serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-api-key, x-request-id');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Create and configure Express app
    const app = createApp();
    
    // Handle the request
    return app(req, res);
    
  } catch (error: any) {
    console.error('Serverless function error:', error);
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

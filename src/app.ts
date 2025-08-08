// src/app.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { initializeFirebase } from './config/firebase';

// Load env
dotenv.config();

// Initialize Firebase Admin (idempotent)
initializeFirebase();

import tripRoutes from './routes/tripRoutes';
import partnerRoutes from './routes/partnerRoutes';
import audioRoutes from './routes/audioRoutes';
import sdkRoutes from './routes/sdkRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

/* --------------------------- Public endpoints --------------------------- */

// HTML landing at "/"
app.get('/', (_req, res) => {
  res
    .status(200)
    .type('html')
    .send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Wayfinder API</title>
    <style>
      :root { color-scheme: light dark; }
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; margin: 0; padding: 2rem; }
      .card { max-width: 860px; margin: 0 auto; padding: 1.75rem; border-radius: 16px; border: 1px solid rgba(128,128,128,.25); }
      h1 { margin: 0 0 .5rem; font-size: 1.9rem; }
      code, pre { background: rgba(128,128,128,.08); padding: .25rem .4rem; border-radius: 6px; }
      ul { line-height: 1.8; }
      a { text-decoration: none; }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>🧭 Wayfinder API</h1>
      <p>Welcome! The API is live and ready.</p>
      <ul>
        <li><a href="/v1">/v1</a> – API index (JSON)</li>
        <li><a href="/v1/health">/v1/health</a> – health check</li>
        <li><a href="/v1/status">/v1/status</a> – runtime info</li>
        <li><a href="/v1/docs">/v1/docs</a> – interactive API docs</li>
      </ul>
      <p>Protected (require Firebase auth):</p>
      <ul>
        <li><code>POST /v1/trip/start</code></li>
        <li><code>PATCH /v1/trip/:id/update</code></li>
        <li><code>GET /v1/trip/:id/nearby-pois?latitude=&longitude=&radius_meters=&category=</code></li>
        <li><code>POST /v1/trip/:id/trigger-event</code></li>
      </ul>
      <p>Repo: <a href="https://github.com/mbrian3168/wayfinder-api">github.com/mbrian3168/wayfinder-api</a></p>
    </main>
  </body>
</html>`);
});

// JSON API index at "/v1"
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
        nearbyPois:
          'GET /v1/trip/:id/nearby-pois?latitude=&longitude=&radius_meters=&category=',
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
    },
    repo: 'https://github.com/mbrian3168/wayfinder-api'
  });
});

// Health
app.get('/v1/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'Wayfinder API', version: 'v1' });
});

// Status
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

// Serve the OpenAPI YAML
app.get('/v1/openapi.yaml', (_req, res) => {
  try {
    const filePath = path.join(process.cwd(), 'src', 'openapi', 'wayfinder_openapi_v1.yaml');
    const yaml = fs.readFileSync(filePath, 'utf8');
    res.setHeader('Content-Type', 'text/yaml; charset=utf-8');
    res.status(200).send(yaml);
  } catch (err) {
    console.error('Failed to serve OpenAPI YAML:', err);
    res.status(500).json({ error: 'OpenAPI spec not found' });
  }
});

// Swagger UI (from CDN) pointing at our YAML
app.get('/v1/docs', (_req, res) => {
  res
    .status(200)
    .type('html')
    .send(`<!doctype html>
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

/* --------------------------- Auth-protected routes --------------------------- */
app.use('/v1/trip', tripRoutes);
app.use('/v1/partner', partnerRoutes);
app.use('/v1/audio', audioRoutes);
app.use('/v1/sdk', sdkRoutes);

export default app;

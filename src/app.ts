import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { initializeFirebase } from './config/firebase';
import prisma from './config/prisma';

// Routes (keep your existing route files)
import tripRoutes from './routes/tripRoutes';
import partnerRoutes from './routes/partnerRoutes';
import audioRoutes from './routes/audioRoutes';
import sdkRoutes from './routes/sdkRoutes';

dotenv.config();
initializeFirebase();

// Create the shared Express app
const app = express();

// Core middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Healthcheck
app.get('/health', (_req, res) => res.status(200).send('Wayfinder API is healthy'));

// API routes
app.use('/v1/trip', tripRoutes);
app.use('/v1/partner', partnerRoutes);
app.use('/v1/audio', audioRoutes);
app.use('/v1/sdk', sdkRoutes);

// Example: ensure Prisma is touched so TS doesn't tree-shake it away in some bundlers
app.get('/_db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
});

export default app;

// src/app.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeFirebase } from './config/firebase';

// Load env
dotenv.config();

// Initialize Firebase Admin once
initializeFirebase();

import tripRoutes from './routes/tripRoutes';
import partnerRoutes from './routes/partnerRoutes';
import audioRoutes from './routes/audioRoutes';
import sdkRoutes from './routes/sdkRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health
app.get('/v1/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'Wayfinder API', version: 'v1' });
});

// API routes
app.use('/v1/trip', tripRoutes);
app.use('/v1/partner', partnerRoutes);
app.use('/v1/audio', audioRoutes);
app.use('/v1/sdk', sdkRoutes);

export default app;

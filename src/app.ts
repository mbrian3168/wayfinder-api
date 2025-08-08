import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { initializeFirebase } from './config/firebase';
import prisma from './config/prisma';

import tripRoutes from './routes/tripRoutes';
import partnerRoutes from './routes/partnerRoutes';
import audioRoutes from './routes/audioRoutes';
import sdkRoutes from './routes/sdkRoutes';

dotenv.config();
initializeFirebase();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/health', (_req, res) => res.status(200).send('Wayfinder API is healthy'));

app.use('/v1/trip', tripRoutes);
app.use('/v1/partner', partnerRoutes);
app.use('/v1/audio', audioRoutes);
app.use('/v1/sdk', sdkRoutes);

app.get('/_db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

export default app;

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initializeFirebase } from './config/firebase';

dotenv.config();
initializeFirebase();

import tripRoutes from './routes/tripRoutes';
import partnerRoutes from './routes/partnerRoutes';
import audioRoutes from './routes/audioRoutes';
import sdkRoutes from './routes/sdkRoutes';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/v1/trip', tripRoutes);
app.use('/v1/partner', partnerRoutes);
app.use('/v1/audio', audioRoutes);
app.use('/v1/sdk', sdkRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).send('Wayfinder API is healthy');
});

// Serve static files from /public (for index.html)
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// Fallback to index.html for root and unknown routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Local dev server (Vercel uses the export)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🧭 Wayfinder API server running on port ${PORT}`);
  });
}

export default app; // Required for Vercel

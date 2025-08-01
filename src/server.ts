import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeFirebase } from './config/firebase';

dotenv.config();
initializeFirebase();

import tripRoutes from './routes/tripRoutes';
import partnerRoutes from './routes/partnerRoutes';
import audioRoutes from './routes/audioRoutes';
import sdkRoutes from './routes/sdkRoutes';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use('/v1/trip', tripRoutes);
app.use('/v1/partner', partnerRoutes);
app.use('/v1/audio', audioRoutes);
app.use('/v1/sdk', sdkRoutes);

app.get('/health', (req, res) => {
  res.status(200).send('Wayfinder API is healthy');
});

app.listen(PORT, () => {
  console.log(`🧭 Wayfinder API server running on port ${PORT}`);
});

export default app; // Required for Vercel

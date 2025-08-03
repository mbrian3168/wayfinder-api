import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { json } from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(json());
app.use(morgan('dev'));

// Serve static HTML from /dist/public
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).send('Wayfinder API is healthy');
});

// Fallback to index.html for everything else
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { json } from 'body-parser';
import dotenv from 'dotenv';
import routes from './routes';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(json());
app.use(morgan('dev'));

// Serve static files from /public
app.use(express.static(path.join(__dirname, '../public')));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).send('Wayfinder API is healthy');
});

// API routes
app.use('/api', routes);

// Fallback for SPA (e.g., React routing or vanilla index.html)
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

export default app;

import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/app';

// Vercel will invoke this function per request.
// We pass the request into the Express app instance.
export default function handler(req: VercelRequest, res: VercelResponse) {
  // @ts-expect-error Express compatibility
  return app(req, res);
}

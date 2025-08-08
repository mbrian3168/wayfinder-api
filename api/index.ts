import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/app';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // @ts-expect-error Express compatibility
  return app(req, res);
}

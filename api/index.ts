// api/index.ts
import app from '../src/app';

// Vercel passes (req, res) — Express app is a compatible handler.
export default function handler(req: any, res: any) {
  return app(req, res);
}

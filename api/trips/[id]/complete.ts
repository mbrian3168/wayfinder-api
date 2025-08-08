import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../_store';
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query as { id: string };
  const trip = db.completeTrip(id);
  if (!trip) return res.status(404).json({ error: 'Not Found' });
  return res.status(200).json(trip);
}

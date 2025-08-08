import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, genId, Trip } from './_store';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const body = req.body || JSON.parse(req.body as any || '{}');
    if (!body?.name || !body?.origin || !body?.destination || !Array.isArray(body?.steps) || body.steps.length === 0) {
      return res.status(400).json({ error: 'Invalid body' });
    }
    const trip = db.createTrip({
      name: body.name,
      origin: body.origin,
      destination: body.destination,
      steps: body.steps.map((s: any, i: number) => ({ id: s.id || `step-${i+1}`, title: s.title, detail: s.detail, status: 'pending' }))
    } as unknown as Trip);
    return res.status(201).json(trip);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
}

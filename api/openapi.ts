import fs from 'node:fs';
import path from 'node:path';

export default async function handler(req: any, res: any) {
  const file = path.join(process.cwd(), 'openapi.json');
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'openapi.json not found' });
  res.setHeader('Content-Type', 'application/json');
  res.send(fs.readFileSync(file, 'utf8'));
}

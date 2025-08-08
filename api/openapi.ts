import fs from 'node:fs';
import path from 'node:path';

export default function handler(_req: any, res: any) {
  res.status(307).setHeader('Location', '/openapi.json').end();
}

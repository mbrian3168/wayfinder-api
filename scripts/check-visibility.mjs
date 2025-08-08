import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const SRC_DIR = 'src/controllers';
const files = [];

function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (p.endsWith('.ts')) files.push(p);
  }
}
walk(SRC_DIR);

const missing = [];
const bad = [];

for (const file of files) {
  const txt = readFileSync(file, 'utf8');
  // Find exported handlers (very simple heuristic)
  const exports = [...txt.matchAll(/export\s+const\s+([a-zA-Z0-9_]+)\s*=\s*async\s*\(/g)].map(m => m[1]);

  for (const fn of exports) {
    const pattern = new RegExp(`\\/\\*\\*[\\s\\S]*?@visibility\\s+(public|partner|internal)[\\s\\S]*?\\*\\/\\s*export\\s+const\\s+${fn}\\s*=`);
    const m = txt.match(pattern);
    if (!m) {
      missing.push(`${file} -> ${fn}`);
    } else {
      const vis = m[1];
      if (!['public','partner','internal'].includes(vis)) {
        bad.push(`${file} -> ${fn} (bad value)`);
      }
    }
  }
}

if (missing.length || bad.length) {
  console.error('❌ Visibility check failed.');
  if (missing.length) {
    console.error('\nHandlers missing @visibility:');
    for (const m of missing) console.error(' -', m);
  }
  if (bad.length) {
    console.error('\nHandlers with invalid @visibility:');
    for (const b of bad) console.error(' -', b);
  }
  process.exit(1);
} else {
  console.log('✅ Visibility check passed.');
}

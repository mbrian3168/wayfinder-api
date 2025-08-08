const fs = require('fs');
const doc = JSON.parse(fs.readFileSync('openapi.json','utf8'));

const must = ['x-visibility','x-owner','x-sla'];
const missing = [];

for (const [p, item] of Object.entries(doc.paths || {})) {
  for (const m of Object.keys(item)) {
    const op = item[m];
    if (!op || typeof op !== 'object') continue;
    must.forEach(k => { if (!op[k]) missing.push(`${m.toUpperCase()} ${p} (${k})`); });
  }
}

if (missing.length) {
  console.error('❌ Missing required extensions on operations:\n' + missing.map(x=>' - '+x).join('\n'));
  process.exit(1);
}
console.log('✅ All operations include x-visibility, x-owner, x-sla');

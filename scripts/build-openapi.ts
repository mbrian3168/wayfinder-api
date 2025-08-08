// scripts/build-openapi.ts
import fs from 'node:fs';
import path from 'node:path';
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { openapiBase } from './openapi.base';

// ⬇️ Import register* functions from your annotated controllers.
import { registerJourneySchemas } from '../src/controllers/journeys.controller';

const registry = new OpenAPIRegistry();
registerJourneySchemas(registry);

const generator = new OpenApiGeneratorV3(registry.definitions);
const doc = generator.generateDocument(openapiBase as any);

// Write to BOTH locations:
// 1) repo root (for lint/typegen/check scripts)
// 2) public/ (so Vercel serves it statically at /openapi.json)
const outRoot = path.join(process.cwd(), 'openapi.json');
const outPublic = path.join(process.cwd(), 'public', 'openapi.json');

fs.mkdirSync(path.dirname(outPublic), { recursive: true });
fs.writeFileSync(outRoot, JSON.stringify(doc, null, 2));
fs.writeFileSync(outPublic, JSON.stringify(doc, null, 2));

console.log('Wrote', outRoot);
console.log('Wrote', outPublic);

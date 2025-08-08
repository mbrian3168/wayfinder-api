// scripts/build-openapi.ts
import fs from 'node:fs';
import path from 'node:path';
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { openapiBase } from './openapi.base';

// ⬇️ Import register* functions from your annotated controllers.
// Example starter (adjust/add as you annotate more):
import { registerJourneySchemas } from '../src/controllers/journeys.controller';

const registry = new OpenAPIRegistry();

// Register schemas from each controller here:
registerJourneySchemas(registry);

// Generate the OpenAPI document
const generator = new OpenApiGeneratorV3(registry.definitions);
const doc = generator.generateDocument(openapiBase as any);

// ⚠️ IMPORTANT: write to /public so Vercel serves it statically
const out = path.join(process.cwd(), 'public', 'openapi.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(doc, null, 2));
console.log('Wrote', out);

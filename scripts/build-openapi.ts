import fs from 'node:fs';
import path from 'node:path';
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { openapiBase } from './openapi.base';

// ⬇️ Import register* functions from your controllers as you annotate them
// Example (you'll create this next):
import { registerJourneySchemas } from '../src/controllers/journeys.controller';

const registry = new OpenAPIRegistry();
registerJourneySchemas(registry); // add more as you go

const generator = new OpenApiGeneratorV3(registry.definitions);
const doc = generator.generateDocument(openapiBase as any);

const out = path.join(process.cwd(), 'openapi.json');
fs.writeFileSync(out, JSON.stringify(doc, null, 2));
console.log('Wrote', out);

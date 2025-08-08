// scripts/build-openapi.ts
// Builds the OpenAPI spec from Zod schemas + controller annotations.
// Writes to BOTH:
//   1) ./openapi.json            (for lint/typegen/check scripts)
//   2) ./public/openapi.json     (so Vercel serves it at /openapi.json)

import fs from 'node:fs';
import path from 'node:path';
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { openapiBase } from './openapi.base';

// ⬇️ Import register* functions from your annotated controllers.
// Add more imports as you annotate additional controllers.
import { registerJourneySchemas } from '../src/controllers/journeys.controller';

async function build() {
  const registry = new OpenAPIRegistry();

  // Register schemas from each controller here:
  registerJourneySchemas(registry);
  // e.g.
  // import { registerAuthSchemas } from '../src/controllers/auth.controller';
  // registerAuthSchemas(registry);

  // Generate the OpenAPI document
  const generator = new OpenApiGeneratorV3(registry.definitions);
  const doc = generator.generateDocument(openapiBase as any);

  // Ensure output dirs exist
  const outRoot = path.join(process.cwd(), 'openapi.json');
  const outPublic = path.join(process.cwd(), 'public', 'openapi.json');
  fs.mkdirSync(path.dirname(outRoot), { recursive: true });
  fs.mkdirSync(path.dirname(outPublic), { recursive: true });

  // Write both files
  const json = JSON.stringify(doc, null, 2);
  fs.writeFileSync(outRoot, json);
  fs.writeFileSync(outPublic, json);

  console.log('Wrote', outRoot);
  console.log('Wrote', outPublic);
}

build().catch((err) => {
  console.error('Failed to build OpenAPI spec:', err);
  process.exit(1);
});

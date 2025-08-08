import { z } from 'zod';
import { extendZodWithOpenApi, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
extendZodWithOpenApi(z);

const Journey = z.object({
  id: z.string().uuid().openapi({ example: 'b5f2f6d4-5a38-4b7e-9b8a-2d8c1e2c0b24' }),
  name: z.string().min(1),
  status: z.enum(['draft','active','archived']),
}).openapi('Journey');

const CreateJourneyBody = z.object({
  name: z.string().min(1),
}).openapi('CreateJourneyBody');

export function registerJourneySchemas(registry: OpenAPIRegistry) {
  registry.register('Journey', Journey);
  registry.register('CreateJourneyBody', CreateJourneyBody);
}

/**
 * @openapi
 * /journeys:
 *   post:
 *     summary: Create a journey
 *     description: Creates a new journey and returns it.
 *     operationId: createJourney
 *     tags: [Journeys]
 *     security:
 *       - bearerAuth: []
 *     x-visibility: public
 *     x-owner: wayfinder-core
 *     x-sla: standard
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJourneyBody'
 *     responses:
 *       '201':
 *         description: Journey created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Journey'
 *       '400': { description: Validation error }
 *       '401': { description: Unauthorized }
 */
export async function createJourney(_req: any, res: any) {
  // stub impl for now
  return res.status(201).json({ id: 'stub-id', name: 'Example', status: 'draft' });
}

 '@asteasolutions/zod-to-openapi';
extendZodWithOpenApi(z);

// Schemas
export const TripStep = z.object({
  id: z.string().optional().openapi({ example: 'step-1' }),
  title: z.string().min(1).openapi({ example: 'Drive to Port of Miami' }),
  detail: z.string().optional().openapi({ example: 'Arrive at Garage C, Level 3' }),
  status: z.enum(['pending','in_progress','done']).default('pending').openapi({ example: 'pending' })
}).openapi('TripStep');

export const Trip = z.object({
  id: z.string().openapi({ example: 'abcd1234' }),
  name: z.string().openapi({ example: 'Royal Caribbean Sail Day' }),
  origin: z.string().openapi({ example: 'Fort Lauderdale, FL' }),
  destination: z.string().openapi({ example: 'Port of Miami' }),
  steps: z.array(TripStep),
  currentIndex: z.number(),
  state: z.enum(['created','started','completed']).openapi({ example: 'created' }),
  createdAt: z.string(),
  updatedAt: z.string()
}).openapi('Trip');

export const CreateTripBody = z.object({
  name: z.string().min(1),
  origin: z.string().min(1),
  destination: z.string().min(1),
  steps: z.array(z.object({
    title: z.string().min(1),
    detail: z.string().optional()
  })).min(1)
}).openapi('CreateTripBody');

export function registerTripSchemas(registry: OpenAPIRegistry) {
  registry.register('TripStep', TripStep);
  registry.register('Trip', Trip);
  registry.register('CreateTripBody', CreateTripBody);
}

/**
 * @openapi
 * /trips:
 *   post:
 *     summary: Create a trip
 *     description: Creates a new trip with an ordered list of steps.
 *     operationId: createTrip
 *     tags: [Trips]
 *     security: []
 *     x-visibility: public
 *     x-owner: wayfinder-core
 *     x-sla: standard
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTripBody'
 *     responses:
 *       '201':
 *         description: Trip created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trip'
 */

/**
 * @openapi
 * /trips/{id}:
 *   get:
 *     summary: Get a trip
 *     operationId: getTrip
 *     tags: [Trips]
 *     security: []
 *     x-visibility: public
 *     x-owner: wayfinder-core
 *     x-sla: standard
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '200': { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/Trip' } } } }
 *       '404': { description: Not Found }
 */

/**
 * @openapi
 * /trips/{id}/start:
 *   post:
 *     summary: Start a trip
 *     operationId: startTrip
 *     tags: [Trips]
 *     security: []
 *     x-visibility: public
 *     x-owner: wayfinder-core
 *     x-sla: standard
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '200': { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/Trip' } } } }
 *       '404': { description: Not Found }
 */

/**
 * @openapi
 * /trips/{id}/advance:
 *   post:
 *     summary: Advance to next step
 *     operationId: advanceTrip
 *     tags: [Trips]
 *     security: []
 *     x-visibility: public
 *     x-owner: wayfinder-core
 *     x-sla: standard
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '200': { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/Trip' } } } }
 *       '404': { description: Not Found }
 */

/**
 * @openapi
 * /trips/{id}/complete:
 *   post:
 *     summary: Complete the trip
 *     operationId: completeTrip
 *     tags: [Trips]
 *     security: []
 *     x-visibility: public
 *     x-owner: wayfinder-core
 *     x-sla: standard
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       '200': { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/Trip' } } } }
 *       '404': { description: Not Found }
 */

export const _noop = true;

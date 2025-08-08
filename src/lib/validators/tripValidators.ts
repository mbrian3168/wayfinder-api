// src/lib/validators/tripValidators.ts
import { z } from 'zod';

/**
 * Reusable coordinate schema.
 * Uses z.coerce.number() so querystring values like "25.774" get parsed to numbers.
 */
const CoordinatesSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

/**
 * POST /v1/trip/start
 * Body: origin, destination, host_id
 */
export const startTripSchema = z.object({
  body: z.object({
    origin: CoordinatesSchema,
    destination: CoordinatesSchema,
    host_id: z.string().uuid('Invalid Host ID format.'),
  }),
});

/**
 * PATCH /v1/trip/:id/update
 * Params: id
 * Body: current_location?, eta_seconds?
 */
export const updateTripSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Trip ID format.'),
  }),
  body: z.object({
    current_location: CoordinatesSchema.optional(),
    eta_seconds: z.coerce.number().int().positive().optional(),
  }),
});

/**
 * Generic validator for routes that only need :id
 */
export const tripIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Trip ID format.'),
  }),
});

/**
 * GET /v1/trip/:id/nearby-pois
 *
 * Validates BOTH:
 *  - route params: :id (uuid)
 *  - query: latitude, longitude, optional radius_meters (default 10,000 = 10km),
 *           optional category (string or string[])
 *
 * NOTE:
 *  - z.coerce.number() converts querystring numbers to real numbers
 *  - radius_meters is capped at 100km to prevent abuse
 */
export const nearbyPoisQuerySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Trip ID format.'),
  }),
  query: z.object({
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    radius_meters: z
      .coerce
      .number()
      .int()
      .positive()
      .max(100_000)
      .default(10_000) // 10 km default
      .optional(),
    category: z.union([z.string(), z.array(z.string())]).optional(),
  }),
});

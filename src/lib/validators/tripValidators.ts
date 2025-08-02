import { z } from 'zod';

const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const startTripSchema = z.object({
  body: z.object({
    origin: CoordinatesSchema,
    destination: CoordinatesSchema,
    host_id: z.string().uuid(),
  }),
});

export const updateTripSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    current_location: CoordinatesSchema.optional(),
    eta_seconds: z.number().int().positive().optional(),
  }),
});

export const tripIdParamSchema = z.object({
    params: z.object({ id: z.string().uuid() })
});

export const nearbyPoisQuerySchema = z.object({
    query: z.object({
        latitude: z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val)),
        longitude: z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val)),
        radius: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val)).optional(),
    })
});

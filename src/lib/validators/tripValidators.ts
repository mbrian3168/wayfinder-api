import { z } from 'zod';

const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const startTripSchema = z.object({
  body: z.object({
    origin: CoordinatesSchema,
    destination: CoordinatesSchema,
    host_id: z.string().uuid('Invalid Host ID format.'),
  }),
});

export const updateTripSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Trip ID format.'),
  }),
  body: z.object({
    current_location: CoordinatesSchema.optional(),
    eta_seconds: z.number().int().positive().optional(),
  }),
});

export const tripIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Trip ID format.'),
  }),
});

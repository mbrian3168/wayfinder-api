import { z } from 'zod';

const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const createPoiSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Partner ID format.'),
  }),
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long.'),
    description: z.string().min(10, 'Description must be at least 10 characters long.'),
    category: z.enum(['LANDMARK', 'NATURE', 'PARTNER_LOCATION', 'FUN_FACT', 'TRAFFIC_ALERT']),
    location: CoordinatesSchema,
    geofence_radius_meters: z.number().int().positive(),
  }),
});

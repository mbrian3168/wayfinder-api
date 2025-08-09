import { z } from 'zod';
import { POICategory } from '@prisma/client';

// Transform lowercase input to uppercase enum values
const categoryTransform = z
  .enum(['landmark', 'nature', 'partner_location', 'fun_fact', 'traffic_alert'])
  .transform((val) => {
    const mapping: Record<string, POICategory> = {
      'landmark': POICategory.LANDMARK,
      'nature': POICategory.NATURE,
      'partner_location': POICategory.PARTNER_LOCATION,
      'fun_fact': POICategory.FUN_FACT,
      'traffic_alert': POICategory.TRAFFIC_ALERT,
    };
    return mapping[val];
  });

export const createPoiSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Partner ID format.')
  }),
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    category: categoryTransform,
    location: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }),
    geofence_radius_meters: z.number().int().positive('Geofence radius must be positive'),
  }),
});

export const scheduleMessageSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Partner ID format.')
  }),
  body: z.object({
    poi_id: z.string().uuid('Invalid POI ID format.'),
    text_content: z.string().min(1),
    // minimal trigger example; expand as needed
    triggers: z.array(z.object({
      type: z.enum(['distance_to_poi', 'eta_to_destination', 'speed', 'time_of_day']),
      operator: z.enum(['less_than', 'greater_than', 'equal_to', 'between']),
      value: z.any()
    })).min(1)
  }),
});

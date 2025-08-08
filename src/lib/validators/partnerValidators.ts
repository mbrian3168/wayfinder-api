import { z } from 'zod';

export const createPoiSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Partner ID format.')
  }),
  body: z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    category: z.enum(['landmark', 'nature', 'partner_location', 'fun_fact', 'traffic_alert']),
    location: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }),
    geofence_radius_meters: z.number().int().positive(),
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

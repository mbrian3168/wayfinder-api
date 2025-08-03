"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPoiSchema = void 0;
const zod_1 = require("zod");
const CoordinatesSchema = zod_1.z.object({
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
});
exports.createPoiSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid Partner ID format.'),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, 'Name must be at least 3 characters long.'),
        description: zod_1.z.string().min(10, 'Description must be at least 10 characters long.'),
        category: zod_1.z.enum(['LANDMARK', 'NATURE', 'PARTNER_LOCATION', 'FUN_FACT', 'TRAFFIC_ALERT']),
        location: CoordinatesSchema,
        geofence_radius_meters: zod_1.z.number().int().positive(),
    }),
});

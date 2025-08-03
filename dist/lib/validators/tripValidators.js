"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nearbyPoisQuerySchema = exports.tripIdParamSchema = exports.updateTripSchema = exports.startTripSchema = void 0;
const zod_1 = require("zod");
const CoordinatesSchema = zod_1.z.object({
    latitude: zod_1.z.number().min(-90).max(90),
    longitude: zod_1.z.number().min(-180).max(180),
});
exports.startTripSchema = zod_1.z.object({
    body: zod_1.z.object({
        origin: CoordinatesSchema,
        destination: CoordinatesSchema,
        host_id: zod_1.z.string().uuid(),
    }),
});
exports.updateTripSchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string().uuid() }),
    body: zod_1.z.object({
        current_location: CoordinatesSchema.optional(),
        eta_seconds: zod_1.z.number().int().positive().optional(),
    }),
});
exports.tripIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string().uuid() })
});
exports.nearbyPoisQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        latitude: zod_1.z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val)),
        longitude: zod_1.z.string().transform(val => parseFloat(val)).refine(val => !isNaN(val)),
        radius: zod_1.z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val)).optional(),
    })
});

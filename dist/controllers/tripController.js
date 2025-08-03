"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerEvent = exports.getNearbyPois = exports.updateTrip = exports.startTrip = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const startTrip = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { origin, destination, host_id } = req.body;
    const firebaseUid = req.user.uid;
    try {
        let user = yield prisma_1.default.user.findUnique({ where: { firebaseUid } });
        if (!user) {
            user = yield prisma_1.default.user.create({ data: { firebaseUid } });
        }
        const newTrip = yield prisma_1.default.trip.create({
            data: {
                userId: user.id,
                hostId: host_id,
                originLat: origin.latitude,
                originLng: origin.longitude,
                destinationLat: destination.latitude,
                destinationLng: destination.longitude,
                status: 'ACTIVE',
            },
        });
        res.status(201).json(newTrip);
    }
    catch (error) {
        console.error('Error starting trip:', error);
        res.status(500).json({ error: 'Failed to start trip.' });
    }
});
exports.startTrip = startTrip;
const updateTrip = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({ message: `Trip ${req.params.id} updated.` });
});
exports.updateTrip = updateTrip;
const getNearbyPois = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { latitude, longitude, radius = '5000' } = req.query;
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const rad = parseInt(radius, 10);
    try {
        const pois = yield prisma_1.default.$queryRaw `
            SELECT *, ST_Distance(
                ST_MakePoint(longitude, latitude)::geography,
                ST_MakePoint(${lon}, ${lat})::geography
            ) as distance
            FROM "pois"
            WHERE ST_DWithin(
                ST_MakePoint(longitude, latitude)::geography,
                ST_MakePoint(${lon}, ${lat})::geography,
                ${rad}
            )
            ORDER BY distance;
        `;
        res.status(200).json(pois);
    }
    catch (error) {
        console.error('Error fetching nearby POIs:', error);
        if (error instanceof Error && error.message.includes('function st_dwithin')) {
            return res.status(500).json({
                error: 'Geospatial query failed. Ensure PostGIS is enabled on the database.'
            });
        }
        res.status(500).json({ error: 'Failed to fetch nearby POIs.' });
    }
});
exports.getNearbyPois = getNearbyPois;
const triggerEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { eventType, poiId } = req.body;
    console.log(`Event '${eventType}' triggered for trip ${req.params.id} at POI ${poiId}`);
    res.status(200).json({ message: 'Event logged.' });
});
exports.triggerEvent = triggerEvent;

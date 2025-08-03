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
exports.scheduleMessage = exports.createPoi = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
// POST /partner/:id/poi - IMPLEMENTED
const createPoi = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const partnerId = req.params.id;
    const { name, description, category, location, geofence_radius_meters } = req.body;
    try {
        // First, verify the partner exists to prevent creating orphaned POIs
        const partner = yield prisma_1.default.partner.findUnique({
            where: { id: partnerId },
        });
        if (!partner) {
            return res.status(404).json({ error: 'Partner not found.' });
        }
        // Create the new POI in the database
        const newPoi = yield prisma_1.default.pOI.create({
            data: {
                partnerId: partnerId,
                name: name,
                description: description,
                category: category,
                latitude: location.latitude,
                longitude: location.longitude,
                geofenceRadiusMeters: geofence_radius_meters,
            },
        });
        res.status(201).json(newPoi);
    }
    catch (error) {
        console.error(`Error creating POI for partner ${partnerId}:`, error);
        res.status(500).json({ error: 'Failed to create Point of Interest.' });
    }
});
exports.createPoi = createPoi;
// POST /partner/:id/schedule-message - REMAINS A STUB
const scheduleMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { poi_id } = req.body;
    const partnerId = req.params.id;
    console.log(`Partner ${partnerId} is scheduling a message for POI ${poi_id}`);
    res.status(201).json({ message: 'Message scheduled successfully (stub).' });
});
exports.scheduleMessage = scheduleMessage;

// src/controllers/tripController.ts
import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { haversineDistance } from '../utils/geoUtils';
import { POI, POICategory, Prisma, Trip, User } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler';
import { NotFoundError, UnauthorizedError, ForbiddenError, ValidationError } from '../utils/errors';

/* -------------------------- Helpers -------------------------- */

const toEnumCategory = (value: string): POICategory | null => {
  switch (value.trim().toLowerCase()) {
    case 'landmark':
      return POICategory.LANDMARK;
    case 'nature':
      return POICategory.NATURE;
    case 'partner_location':
      return POICategory.PARTNER_LOCATION;
    case 'fun_fact':
      return POICategory.FUN_FACT;
    case 'traffic_alert':
      return POICategory.TRAFFIC_ALERT;
    default:
      return null;
  }
};

/**
 * Build a Prisma where filter for category query param.
 * Supports: ?category=landmark OR ?category=landmark&category=nature
 */
const buildCategoryWhere = (categoryParam: unknown): Prisma.POIWhereInput | undefined => {
  if (!categoryParam) return undefined;

  const values: string[] = Array.isArray(categoryParam)
    ? (categoryParam as string[])
    : [String(categoryParam)];

  const mapped = values
    .map(toEnumCategory)
    .filter((v): v is POICategory => v !== null);

  if (mapped.length === 0) return undefined;

  return mapped.length === 1
    ? { category: mapped[0] }
    : { category: { in: mapped } };
};

/**
 * Resolve or create a Wayfinder User row from Firebase UID.
 * Assumes auth middleware has attached req.user?.uid
 */
const getOrCreateUserByFirebaseUid = async (firebaseUid: string): Promise<User> => {
  let user = await prisma.user.findUnique({ where: { firebaseUid } });
  if (!user) {
    user = await prisma.user.create({ data: { firebaseUid } });
  }
  return user;
};

/* -------------------------- Controllers -------------------------- */

/**
 * POST /v1/trip/start
 * Body: {
 *   origin: { latitude, longitude },
 *   destination: { latitude, longitude },
 *   host_id: string (uuid)
 * }
 */
export const startTrip = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { origin, destination, host_id } = req.body as {
      origin: { latitude: number; longitude: number };
      destination: { latitude: number; longitude: number };
      host_id: string;
    };

    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
      throw new UnauthorizedError('User authentication required');
    }

    // Verify host exists
    const host = await prisma.hostProfile.findUnique({ where: { id: host_id } });
    if (!host) {
      throw new ValidationError('Invalid host_id: Host profile not found');
    }

    const user = await getOrCreateUserByFirebaseUid(firebaseUid);

    const trip: Trip = await prisma.trip.create({
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

    console.log(`🚀 Trip started: ${trip.id}`, {
      requestId: req.id,
      userId: firebaseUid,
      hostId: host_id,
      origin: `${origin.latitude},${origin.longitude}`,
      destination: `${destination.latitude},${destination.longitude}`,
    });

    res.status(201).json(trip);
  }
);

/**
 * PATCH /v1/trip/:id/update
 * Body: {
 *   current_location?: { latitude, longitude },
 *   eta_seconds?: number
 * }
 */
export const updateTrip = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { current_location, eta_seconds } = req.body as {
      current_location?: { latitude: number; longitude: number };
      eta_seconds?: number;
    };

    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
      throw new UnauthorizedError('User authentication required');
    }

    // Verify the trip exists and belongs to the user
    const existingTrip = await prisma.trip.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingTrip) {
      throw new NotFoundError('Trip not found');
    }

    if (existingTrip.user.firebaseUid !== firebaseUid) {
      throw new ForbiddenError('Access denied: Trip belongs to another user');
    }

    // Prepare update data
    const updateData: any = {};
    
    // For now, we'll store current location in existing lat/lng fields
    // TODO: Add dedicated currentLat/currentLng fields to schema
    if (current_location) {
      updateData.originLat = current_location.latitude;
      updateData.originLng = current_location.longitude;
    }
    
    // TODO: Add etaSeconds field to Trip model
    // if (eta_seconds) {
    //   updateData.etaSeconds = eta_seconds;
    // }

    const trip = await prisma.trip.update({
      where: { id },
      data: updateData,
    });

    console.log(`🚗 Trip updated: ${id}`, {
      requestId: req.id,
      userId: firebaseUid,
      hasLocation: !!current_location,
      hasEta: !!eta_seconds,
    });

    res.status(200).json(trip);
  }
);

/**
 * GET /v1/trip/:id/nearby-pois
 * Query: latitude, longitude, radius_meters?, category? (string or string[])
 *
 * Tries PostGIS (ST_DWithin/ST_DistanceSphere) with parameterized query.
 * Falls back to Haversine + in-app filter if PostGIS functions are unavailable
 * or if multiple categories were provided.
 */
export const getNearbyPois = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { latitude, longitude, radius_meters = '5000', category } = req.query;

    const lat: number = parseFloat(String(latitude));
    const lng: number = parseFloat(String(longitude));
    const radius: number = parseFloat(String(radius_meters));

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new ValidationError('Invalid latitude/longitude');
    }

    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
      throw new UnauthorizedError('User authentication required');
    }

    // Verify the trip exists and belongs to the user
    const { id } = req.params;
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!trip) {
      throw new NotFoundError('Trip not found');
    }

    if (trip.user.firebaseUid !== firebaseUid) {
      throw new ForbiddenError('Access denied: Trip belongs to another user');
    }

    // Build Prisma where
    const where = buildCategoryWhere(category);

    // If supplied categories collapse to a single value, try PostGIS.
    const singleCategory: POICategory | null =
      typeof where?.category === 'string'
        ? (where!.category as POICategory)
        : null;

    if (singleCategory) {
      try {
        type Row = POI & { distance: number };
        const rows = await prisma.$queryRaw<Row[]>`
          SELECT p.*,
                 ST_DistanceSphere(
                   ST_MakePoint(p."longitude", p."latitude"),
                   ST_MakePoint(${lng}, ${lat})
                 ) AS distance
          FROM "POI" AS p
          WHERE p."category" = ${singleCategory}
            AND ST_DWithin(
              ST_MakePoint(p."longitude", p."latitude")::geography,
              ST_MakePoint(${lng}, ${lat})::geography,
              ${radius}
            )
          ORDER BY distance ASC
        `;
        
        console.log(`📍 Found ${rows.length} nearby POIs (PostGIS)`, {
          requestId: req.id,
          tripId: id,
          location: `${lat},${lng}`,
          radius,
          category: singleCategory,
        });
        
        res.json(rows);
        return;
      } catch (err) {
        console.warn('PostGIS path failed; falling back to Haversine:', err);
      }
    }

    // Fallback: fetch via Prisma and filter/sort in app
    const allPois: POI[] = await prisma.pOI.findMany({ where });
    const withDistance: (POI & { distance: number })[] = allPois
      .map((poi: POI) => {
        const distance = haversineDistance(lat, lng, poi.latitude, poi.longitude);
        return { ...poi, distance };
      })
      .filter((poi) => poi.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    console.log(`📍 Found ${withDistance.length} nearby POIs (Haversine)`, {
      requestId: req.id,
      tripId: id,
      location: `${lat},${lng}`,
      radius,
      totalChecked: allPois.length,
    });

    res.json(withDistance);
  }
);

/**
 * POST /v1/trip/:id/trigger-event
 * Body: { eventType: string, poiId?: string }
 *
 * Stub implementation — add TripEvent model if you want to persist these.
 */
export const triggerEvent = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { eventType, poiId } = req.body as { eventType: string; poiId?: string };

    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
      throw new UnauthorizedError('User authentication required');
    }

    // Verify the trip exists and belongs to the user
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!trip) {
      throw new NotFoundError('Trip not found');
    }

    if (trip.user.firebaseUid !== firebaseUid) {
      throw new ForbiddenError('Access denied: Trip belongs to another user');
    }

    // TODO: Add TripEvent model to persist these events
    console.log(`🎬 Trip event triggered: ${eventType}`, {
      requestId: req.id,
      tripId: id,
      eventType,
      poiId,
      userId: firebaseUid,
    });

    res.status(201).json({ 
      ok: true, 
      eventType, 
      tripId: id,
      timestamp: new Date().toISOString() 
    });
  }
);

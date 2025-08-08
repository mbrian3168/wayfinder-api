// src/controllers/tripController.ts
import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { haversineDistance } from '../utils/geoUtils';
import { POI, POICategory, Prisma, Trip, User } from '@prisma/client';

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
export const startTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const { origin, destination, host_id } = req.body as {
      origin: { latitude: number; longitude: number };
      destination: { latitude: number; longitude: number };
      host_id: string;
    };

    const firebaseUid = req.user?.uid;
    if (!firebaseUid) {
      res.status(401).json({ error: 'Unauthorized: missing Firebase UID.' });
      return;
    }

    const user = await getOrCreateUserByFirebaseUid(firebaseUid);

    const trip: Trip = await prisma.trip.create({
      data: {
        userId: user.id,               // ✅ required by schema
        hostId: host_id,
        originLat: origin.latitude,
        originLng: origin.longitude,
        destinationLat: destination.latitude,
        destinationLng: destination.longitude,
        status: 'ACTIVE',
      },
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error('Error starting trip:', error);
    res.status(500).json({ error: 'Failed to start trip.' });
  }
};

/**
 * PATCH /v1/trip/:id/update
 * Body: {
 *   current_location?: { latitude, longitude },
 *   eta_seconds?: number
 * }
 *
 * NOTE: If you want to persist current location or ETA, add fields to the Trip model
 * and update here accordingly. For now, this is a no-op update (keeps API shape).
 */
export const updateTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // const { current_location, eta_seconds } = req.body as {
    //   current_location?: { latitude: number; longitude: number };
    //   eta_seconds?: number;
    // };

    const trip = await prisma.trip.update({
      where: { id },
      data: {
        // Example (uncomment after adding fields in Prisma schema):
        // currentLat: current_location?.latitude,
        // currentLng: current_location?.longitude,
        // etaSeconds: eta_seconds,
      },
    });

    res.status(200).json(trip);
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ error: 'Failed to update trip.' });
  }
};

/**
 * GET /v1/trip/:id/nearby-pois
 * Query: latitude, longitude, radius_meters?, category? (string or string[])
 *
 * Tries PostGIS (ST_DWithin/ST_DistanceSphere) with parameterized query.
 * Falls back to Haversine + in-app filter if PostGIS functions are unavailable
 * or if multiple categories were provided.
 */
export const getNearbyPois = async (req: Request, res: Response): Promise<void> => {
  try {
    const { latitude, longitude, radius_meters = '5000', category } = req.query;

    const lat: number = parseFloat(String(latitude));
    const lng: number = parseFloat(String(longitude));
    const radius: number = parseFloat(String(radius_meters));

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      res.status(400).json({ error: 'Invalid latitude/longitude.' });
      return;
    }

    // Build Prisma where
    const where = buildCategoryWhere(category);

    // If supplied categories collapse to a single value, try PostGIS.
    // If multiple categories (where.category is an { in: [...] }), skip PostGIS and do Haversine.
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

    res.json(withDistance);
  } catch (error) {
    console.error('Error fetching nearby POIs:', error);
    res.status(500).json({ error: 'Failed to fetch nearby POIs.' });
  }
};

/**
 * POST /v1/trip/:id/trigger-event
 * Body: { eventType: string, poiId?: string }
 *
 * Stub implementation — add TripEvent model if you want to persist these.
 */
export const triggerEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { eventType, poiId } = req.body as { eventType: string; poiId?: string };

    // If you add a TripEvent model, create it here.
    console.log(`Trip ${id} event: ${eventType}${poiId ? ` @ POI ${poiId}` : ''}`);

    res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Error triggering event:', error);
    res.status(500).json({ error: 'Failed to trigger event.' });
  }
};

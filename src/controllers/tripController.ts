// src/controllers/tripController.ts
import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { haversineDistance } from '../utils/geoUtils';
import { POI, POICategory, Prisma, Trip } from '@prisma/client';

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

const buildCategoryWhere = (categoryParam: unknown): Prisma.POIWhereInput | undefined => {
  if (!categoryParam) return undefined;

  // Supports ?category=landmark or ?category=landmark&category=nature
  const values: string[] = Array.isArray(categoryParam)
    ? (categoryParam as string[])
    : [String(categoryParam)];

  const mapped = values
    .map(toEnumCategory)
    .filter((v): v is POICategory => v !== null);

  if (mapped.length === 0) return undefined;

  // Single or multiple categories
  return mapped.length === 1
    ? { category: mapped[0] }
    : { category: { in: mapped } };
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

    // You likely have a Firebase user mapped to a Wayfinder User row.
    // If you maintain User records, look up by req.user!.uid here.
    // For MVP, we’ll just create the Trip without user relation (or adapt if needed).

    const trip: Trip = await prisma.trip.create({
      data: {
        hostId: host_id, // matches Prisma field hostId
        originLat: origin.latitude,
        originLng: origin.longitude,
        destinationLat: destination.latitude,
        destinationLng: destination.longitude,
        status: 'ACTIVE', // TripStatus enum default exists in schema too
        // startedAt set by default? If not, we can set startedAt: new Date()
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
 */
export const updateTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { current_location, eta_seconds } = req.body as {
      current_location?: { latitude: number; longitude: number };
      eta_seconds?: number;
    };

    // Your Prisma Trip model (from earlier schema) does not define current_lat/lng columns.
    // If you want to persist current location, add fields in Prisma schema and migrate.
    // For now, we’ll just update status/placeholder fields if present.
    const trip = await prisma.trip.update({
      where: { id },
      data: {
        // Example: store ETA in a Json field or a dedicated column if you add one later
        // etaSeconds: eta_seconds,  <-- add to schema if desired
        // currentLat: current_location?.latitude,
        // currentLng: current_location?.longitude,
        // updatedAt: new Date(),   <-- add mapped column or use @@updatedAt
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
 * Falls back to Haversine + in-app filter if PostGIS functions are unavailable.
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

    const where = buildCategoryWhere(category);

    // Attempt PostGIS path
    try {
      // Convert categories to Postgres enum text (optional filter)
      // Using parameterized query to avoid injection.
      const hasCategoryFilter = !!where?.category;

      type Row = POI & { distance: number };
      const rows: Row[] = await prisma.$queryRaw<
        Row[]
      >`
        SELECT p.*,
               ST_DistanceSphere(
                 ST_MakePoint(p."longitude", p."latitude"),
                 ST_MakePoint(${lng}, ${lat})
               ) AS distance
        FROM "POI" AS p
        WHERE ${hasCategoryFilter
          ? Prisma.sql`p."category" = ${(
              (where!.category as POICategory) ??
              ((where!.category as Prisma.EnumPOICategoryFilter<'POI'>)?.in?.[0] as POICategory)
            )}`
          : Prisma.sql`TRUE`}
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
      console.warn('PostGIS not available, falling back to Haversine:', err);
    }

    // Fallback: fetch POIs and filter by Haversine distance
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

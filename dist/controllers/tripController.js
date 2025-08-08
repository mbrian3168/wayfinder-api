// src/controllers/tripController.ts
import { Request, Response } from 'express';
import prisma from '../lib/prismaClient';
import { haversineDistance } from '../utils/geoUtils';

/**
 * Get nearby POIs with PostGIS optimization (fallback to Haversine)
 */
export const getNearbyPois = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius_meters = 5000, category } = req.query;

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const radius = parseFloat(radius_meters as string);

    let pois: any[] = [];

    try {
      // Try PostGIS — if DB has ST_DWithin support
      pois = await prisma.$queryRawUnsafe(`
        SELECT *,
               ST_DistanceSphere(
                 ST_MakePoint(longitude, latitude),
                 ST_MakePoint(${lng}, ${lat})
               ) AS distance
        FROM "POI"
        ${category ? `WHERE category = '${category}'` : ''}
        AND ST_DWithin(
          ST_MakePoint(longitude, latitude)::geography,
          ST_MakePoint(${lng}, ${lat})::geography,
          ${radius}
        )
        ORDER BY distance ASC
      `);
    } catch (err) {
      console.warn('PostGIS not available, falling back to Haversine:', err);

      // Fallback: get all POIs from DB and filter manually
      const allPois = await prisma.pOI.findMany({
        where: category ? { category: category as string } : {},
      });

      pois = allPois
        .map((poi) => {
          const distance = haversineDistance(lat, lng, poi.lat, poi.lng);
          return { ...poi, distance };
        })
        .filter((poi) => poi.distance <= radius)
        .sort((a, b) => a.distance - b.distance);
    }

    res.json(pois);
  } catch (error) {
    console.error('Error fetching nearby POIs:', error);
    res.status(500).json({ error: 'Failed to fetch nearby POIs' });
  }
};

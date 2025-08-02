import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { POI } from '@prisma/client';

export const startTrip = async (req: Request, res: Response) => {
  const { origin, destination, host_id } = req.body;
  const firebaseUid = req.user!.uid;

  try {
    let user = await prisma.user.findUnique({ where: { firebaseUid } });
    if (!user) {
      user = await prisma.user.create({ data: { firebaseUid } });
    }

    const newTrip = await prisma.trip.create({
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
  } catch (error) {
    console.error('Error starting trip:', error);
    res.status(500).json({ error: 'Failed to start trip.' });
  }
};

export const updateTrip = async (req: Request, res: Response) => {
  res.status(200).json({ message: `Trip ${req.params.id} updated.` });
};

export const getNearbyPois = async (req: Request, res: Response) => {
    const { latitude, longitude, radius = '5000' } = req.query;

    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);
    const rad = parseInt(radius as string, 10);

    try {
        const pois = await prisma.$queryRaw<POI[]>`
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
    } catch (error) {
        console.error('Error fetching nearby POIs:', error);
        if (error instanceof Error && error.message.includes('function st_dwithin')) {
            return res.status(500).json({
                error: 'Geospatial query failed. Ensure PostGIS is enabled on the database.'
            });
        }
        res.status(500).json({ error: 'Failed to fetch nearby POIs.' });
    }
};

export const triggerEvent = async (req: Request, res: Response) => {
  const { eventType, poiId } = req.body;
  console.log(`Event '${eventType}' triggered for trip ${req.params.id} at POI ${poiId}`);
  res.status(200).json({ message: 'Event logged.' });
};

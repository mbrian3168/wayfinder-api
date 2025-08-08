// src/controllers/tripController.ts
import { Request, Response } from 'express';
import prisma from '../lib/prismaClient';
import { haversineDistance } from '../utils/geoUtils';

/**
 * Start a new trip
 */
export const startTrip = async (req: Request, res: Response) => {
  try {
    const { origin, destination, host_id } = req.body;

    const trip = await prisma.trip.create({
      data: {
        origin_lat: origin.lat,
        origin_lng: origin.lng,
        destination_lat: destination.lat,
        destination_lng: destination.lng,
        host_id,
        status: 'ACTIVE',
        created_at: new Date(),
      },
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error('Error starting trip:', error);
    res.status(500).json({ error: 'Failed to start trip' });
  }
};

/**
 * Update trip location / ETA
 */
export const updateTrip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { current_location, eta_seconds } = req.body;

    const trip = await prisma.trip.update({
      where: { id },
      data: {
        current_lat: current_location?.lat,
        current_lng: current_location?.lng,
        eta_seconds,
        updated_at: new Date(),
      },
    });

    res.json(trip);
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ error: 'Failed to update trip' });
  }
};

/**
 * Get nearby POIs based on user's current location
 */
export const getNearbyPois = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, radius_meters = 5000, category } = req.query;

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);
    const radius = parseFloat(radius_meters as string);

    // Get POIs from DB (filter category if given)
    const pois = await prisma.pOI.findMany({
      where: category ? { category: category as string } : {},
    });

    // Calculate distances & filter within radius
    const nearby = pois
      .map((poi) => {
        const distance = haversineDistance(lat, lng, poi.lat, poi.lng);
        return { ...poi, distance };
      })
      .filter((poi) => poi.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    res.json(nearby);
  } catch (error) {
    console.error('Error fetching nearby POIs:', error);
    res.status(500).json({ error: 'Failed to fetch nearby POIs' });
  }
};

/**
 * Trigger an event for the trip (e.g., reached POI, completed route)
 */
export const triggerEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { eventType, poiId } = req.body;

    const event = await prisma.tripEvent.create({
      data: {
        trip_id: id,
        event_type: eventType,
        poi_id: poiId || null,
        created_at: new Date(),
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error triggering trip event:', error);
    res.status(500).json({ error: 'Failed to trigger event' });
  }
};

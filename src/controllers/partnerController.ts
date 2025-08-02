import { Request, Response } from 'express';
import prisma from '../config/prisma';

// POST /partner/:id/poi - IMPLEMENTED
export const createPoi = async (req: Request, res: Response) => {
  const partnerId = req.params.id;
  const { name, description, category, location, geofence_radius_meters } = req.body;

  try {
    // First, verify the partner exists to prevent creating orphaned POIs
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      return res.status(404).json({ error: 'Partner not found.' });
    }

    // Create the new POI in the database
    const newPoi = await prisma.pOI.create({
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
  } catch (error) {
    console.error(`Error creating POI for partner ${partnerId}:`, error);
    res.status(500).json({ error: 'Failed to create Point of Interest.' });
  }
};

// POST /partner/:id/schedule-message - REMAINS A STUB
export const scheduleMessage = async (req: Request, res: Response) => {
  const { poi_id } = req.body;
  const partnerId = req.params.id;
  console.log(`Partner ${partnerId} is scheduling a message for POI ${poi_id}`);
  res.status(201).json({ message: 'Message scheduled successfully (stub).' });
};

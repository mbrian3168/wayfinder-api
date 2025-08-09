import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { asyncHandler } from '../middleware/errorHandler';
import { NotFoundError, ValidationError } from '../utils/errors';

// POST /partner/:id/poi - IMPLEMENTED
export const createPoi = asyncHandler(
  async (req: Request, res: Response) => {
    const partnerId = req.params.id;
    const { name, description, category, location, geofence_radius_meters } = req.body;

    // First, verify the partner exists to prevent creating orphaned POIs
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      throw new NotFoundError('Partner not found');
    }

    // Create the new POI in the database
    const newPoi = await prisma.pOI.create({
      data: {
        partnerId: partnerId,
        name: name,
        description: description,
        category: category, // Already transformed by validation middleware
        latitude: location.latitude,
        longitude: location.longitude,
        geofenceRadiusMeters: geofence_radius_meters,
      },
    });

    console.log(`📍 POI created for partner ${partnerId}:`, {
      requestId: req.id,
      partnerId,
      poiId: newPoi.id,
      name: newPoi.name,
      category: newPoi.category,
      location: `${newPoi.latitude},${newPoi.longitude}`,
    });

    res.status(201).json(newPoi);
  }
);

// POST /partner/:id/schedule-message - REMAINS A STUB
export const scheduleMessage = asyncHandler(
  async (req: Request, res: Response) => {
    const { poi_id } = req.body;
    const partnerId = req.params.id;
    
    // TODO: Implement actual message scheduling logic
    console.log(`📬 Partner ${partnerId} scheduling message for POI ${poi_id}`, {
      requestId: req.id,
      partnerId,
      poiId: poi_id,
    });
    
    res.status(201).json({ 
      message: 'Message scheduled successfully (stub)', 
      partnerId,
      poiId: poi_id,
      timestamp: new Date().toISOString(),
    });
  }
);

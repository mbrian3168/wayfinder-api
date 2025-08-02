import { Request, Response } from 'express';

export const createPoi = async (req: Request, res: Response) => {
  const { name } = req.body;
  const partnerId = req.params.id;
  console.log(`Partner ${partnerId} is creating POI: ${name}`);
  res.status(201).json({ message: 'POI created successfully (stub).' });
};

export const scheduleMessage = async (req: Request, res: Response) => {
  const { poi_id } = req.body;
  const partnerId = req.params.id;
  console.log(`Partner ${partnerId} is scheduling a message for POI ${poi_id}`);
  res.status(201).json({ message: 'Message scheduled successfully (stub).' });
};

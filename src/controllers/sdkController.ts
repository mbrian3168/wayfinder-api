import { Request, Response } from 'express';

export const getSdkConfig = async (req: Request, res: Response) => {
  console.log(`SDK is initializing for user ${req.user?.uid}`);
  res.status(200).json({
    voice_pack: 'default_cruise_pack',
    enable_banter_engine: true,
    api_version: 'v1'
  });
};

export const reportEvent = async (req: Request, res: Response) => {
  const { eventName } = req.body;
  console.log(`SDK reported event '${eventName}' for user ${req.user?.uid}`);
  res.status(200).json({ message: 'Event report received.' });
};

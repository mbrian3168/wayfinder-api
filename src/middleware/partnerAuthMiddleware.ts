import { Request, Response, NextFunction } from 'express';

export const verifyPartnerApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.PARTNER_API_KEY) {
    return res.status(403).send({ error: 'Forbidden: Invalid or missing API Key.' });
  }

  next();
};

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    export interface Request {
      id: string;
      user?: {
        uid: string;
        email?: string;
      };
    }
  }
}

export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
};

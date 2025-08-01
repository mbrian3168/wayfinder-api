import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

declare global {
  namespace Express {
    export interface Request {
      user?: {
        uid: string;
        /mail?: string;
      };
    };
  }
}

export const decodeFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];

  if (!idToken) {
    return res.status(401).send({ error: 'Unauthorized: No token provided.' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email
    };
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(401).send({ error: 'Unauthorized: Invalid token.' });
  }
};

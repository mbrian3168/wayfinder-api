import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { UnauthorizedError } from '../utils/errors';
import { asyncHandler } from '../middleware/errorHandler';

export const decodeFirebaseToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new UnauthorizedError('Authorization header is required');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authorization header must start with "Bearer "');
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken) {
      throw new UnauthorizedError('No token provided');
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
      };
      
      console.log(`🔓 User authenticated: ${decodedToken.uid}`, {
        requestId: req.id,
        email: decodedToken.email,
      });
      
      next();
    } catch (error: any) {
      console.error('🚫 Firebase token verification failed:', {
        error: error.message,
        requestId: req.id,
      });
      
      if (error.code === 'auth/id-token-expired') {
        throw new UnauthorizedError('Token has expired');
      } else if (error.code === 'auth/id-token-revoked') {
        throw new UnauthorizedError('Token has been revoked');
      } else {
        throw new UnauthorizedError('Invalid token');
      }
    }
  }
);

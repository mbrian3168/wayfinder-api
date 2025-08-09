import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { asyncHandler } from '../middleware/errorHandler';
import { env } from '../config/environment';

// TODO: Replace with database-backed partner API keys
// This is a temporary implementation using a single shared key
const VALID_PARTNER_KEYS = new Set([
  env.PARTNER_API_KEY,
  // Add more partner keys here as needed
]);

export const verifyPartnerApiKey = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      throw new UnauthorizedError('API key is required in x-api-key header');
    }
    
    if (!VALID_PARTNER_KEYS.has(apiKey)) {
      console.warn('🚨 Invalid partner API key attempt:', {
        requestId: req.id,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        url: req.url,
      });
      throw new ForbiddenError('Invalid API key');
    }
    
    // Log successful partner API usage
    console.log('🤝 Partner API access:', {
      requestId: req.id,
      partnerId: req.params.id,
      endpoint: req.url,
      method: req.method,
    });
    
    next();
  }
);

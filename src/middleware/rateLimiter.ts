import rateLimit from 'express-rate-limit';
import { TooManyRequestsError } from '../utils/errors';

// General API rate limiting
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: {
      message: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutes',
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    throw new TooManyRequestsError('Too many requests from this IP, please try again later.');
  },
});

// Stricter rate limiting for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs for auth
  message: {
    error: {
      message: 'Too many authentication attempts, please try again later.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutes',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    throw new TooManyRequestsError('Too many authentication attempts, please try again later.');
  },
});

// Very strict rate limiting for trip creation
export const tripCreationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 trip creations per 5 minutes
  message: {
    error: {
      message: 'Too many trip creation attempts, please try again later.',
      code: 'TRIP_CREATION_RATE_LIMIT_EXCEEDED',
      retryAfter: '5 minutes',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    throw new TooManyRequestsError('Too many trip creation attempts, please try again later.');
  },
});

// Partner API rate limiting (more generous for authenticated partners)
export const partnerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Partners get higher limits
  message: {
    error: {
      message: 'Partner API rate limit exceeded, please try again later.',
      code: 'PARTNER_RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutes',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    throw new TooManyRequestsError('Partner API rate limit exceeded, please try again later.');
  },
});

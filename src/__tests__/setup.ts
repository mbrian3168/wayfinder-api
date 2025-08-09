// Test setup file
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock Firebase Admin for tests
jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
  auth: () => ({
    verifyIdToken: jest.fn(),
  }),
}));

// Mock Prisma for tests
jest.mock('../config/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    trip: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    pOI: {
      findMany: jest.fn(),
    },
    partner: {
      findUnique: jest.fn(),
    },
    hostProfile: {
      findUnique: jest.fn(),
    },
    $queryRaw: jest.fn(),
  },
}));

// Increase timeout for async operations
jest.setTimeout(10000);

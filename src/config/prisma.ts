import { PrismaClient } from '@prisma/client';

// Global variable to hold the Prisma instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create a singleton Prisma client optimized for serverless
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// Use global variable in development to prevent multiple instances
// In production (serverless), create new instance each time
const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Graceful shutdown for development
if (process.env.NODE_ENV === 'development') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

export default prisma;

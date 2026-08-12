import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL;
  return new PrismaClient({
    ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

// In development, recreate client to replace any stale global instance from previous env configuration
if (process.env.NODE_ENV !== 'production' || !globalForPrisma.prisma) {
  globalForPrisma.prisma = createPrismaClient();
}

export const db = globalForPrisma.prisma;


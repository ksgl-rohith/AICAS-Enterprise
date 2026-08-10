import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && envUrl.startsWith('file:')) {
    return envUrl;
  }
  return 'file:./dev.db';
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

// In development, recreate client to replace any stale global instance from previous env configuration
if (process.env.NODE_ENV !== 'production' || !globalForPrisma.prisma) {
  globalForPrisma.prisma = createPrismaClient();
}

export const db = globalForPrisma.prisma;


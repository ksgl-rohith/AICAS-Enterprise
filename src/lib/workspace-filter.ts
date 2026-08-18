import { db } from '@/lib/db';

export async function getBrandsForWorkspace(
  workspaceId: string | null | undefined,
  userId?: string | null
): Promise<string[]> {
  if (!workspaceId) {
    if (userId) {
      const userBrands = await db.brand.findMany({
        where: { userId, isArchived: false },
        select: { id: true },
        orderBy: { createdAt: 'desc' },
      });
      return userBrands.map((b) => b.id);
    }
    return [];
  }

  const targetWorkspace = workspaceId.trim();

  // Query database strictly by workspaceId (or userId fallback if workspaceId was null during legacy creation)
  const brands = await db.brand.findMany({
    where: {
      OR: [
        { workspaceId: targetWorkspace },
        ...(userId ? [{ userId, workspaceId: null }] : []),
      ],
      isArchived: false,
    },
    select: { id: true },
    orderBy: { createdAt: 'desc' },
  });

  return brands.map((b) => b.id);
}


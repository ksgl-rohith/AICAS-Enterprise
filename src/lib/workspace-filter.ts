import { db } from '@/lib/db';

export async function getBrandsForWorkspace(workspaceId: string | null | undefined): Promise<string[]> {
  const targetWorkspace = workspaceId || 'tenant-default';

  let brandFilter: any = {};

  if (targetWorkspace === 'tenant-legal-002') {
    brandFilter = {
      OR: [
        { name: { contains: 'Legal', mode: 'insensitive' } },
        { name: { contains: 'Kandvate', mode: 'insensitive' } },
      ],
    };
  } else if (targetWorkspace === 'tenant-demo-003') {
    brandFilter = {
      name: { contains: '[DEMO]', mode: 'insensitive' },
    };
  } else {
    // Default ApexAI Enterprise workspace: non-legal corporate brands
    brandFilter = {
      NOT: {
        name: { contains: 'Legal', mode: 'insensitive' },
      },
    };
  }

  const brands = await db.brand.findMany({
    where: brandFilter,
    select: { id: true },
  });

  return brands.map((b) => b.id);
}

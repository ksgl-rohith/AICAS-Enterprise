import { z } from 'zod';
import { db } from '@/lib/db';

export const BrandContextPackageSchema = z.object({
  tenantId: z.string().default('tenant-default'),
  brandId: z.string(),
  brandName: z.string(),
  industry: z.string(),
  description: z.string(),
  products: z.array(z.string()),
  targetAudience: z.string(),
  personality: z.string(),
  tone: z.string(),
  preferredVocabulary: z.array(z.string()),
  prohibitedPhrases: z.array(z.string()),
  requiredDisclaimers: z.array(z.string()),
  defaultCTA: z.string(),
  region: z.string(),
  language: z.string(),
  brandColors: z.array(z.string()),
  competitors: z.array(z.string()),
  groundedChunks: z.array(
    z.object({
      chunkId: z.string(),
      documentId: z.string(),
      filename: z.string(),
      content: z.string(),
      score: z.number(),
    })
  ),
  documentCount: z.number(),
  chunkCount: z.number(),
  socialProfiles: z.array(
    z.object({
      platform: z.string(),
      accountName: z.string(),
      status: z.string(),
    })
  ),
  recentCampaigns: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      objective: z.string(),
      status: z.string(),
    })
  ),
  generatedAt: z.string(),
});

export type BrandContextPackage = z.infer<typeof BrandContextPackageSchema>;

export class BrandContextPackageBuilder {
  public async buildPackage(brandId: string, query?: string, tenantId: string = 'tenant-default'): Promise<BrandContextPackage | null> {
    const brand = await db.brand.findUnique({
      where: { id: brandId },
      include: {
        knowledgeDocs: true,
        knowledgeChunks: true,
        campaigns: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        platformConnections: true,
      },
    });

    if (!brand) return null;

    const queryLower = (query || '').toLowerCase().trim();
    const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 3);

    // Rank & select grounded RAG chunks
    const rankedChunks = brand.knowledgeChunks
      .map((chunk) => {
        let score = 0.5;
        if (queryWords.length > 0) {
          const contentLower = chunk.content.toLowerCase();
          const matches = queryWords.filter((word) => contentLower.includes(word));
          score = matches.length > 0 ? 0.6 + (matches.length / queryWords.length) * 0.35 : 0.3;
        }
        const doc = brand.knowledgeDocs.find((d) => d.id === chunk.documentId);
        return {
          chunkId: chunk.id,
          documentId: chunk.documentId,
          filename: doc?.filename || 'Brand Knowledge Document',
          content: chunk.content,
          score: Math.min(1.0, score),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const products = brand.products
      ? brand.products.split(',').map((p) => p.trim()).filter(Boolean)
      : [];

    const preferredVocabulary = brand.preferredVocabulary
      ? brand.preferredVocabulary.split(',').map((v) => v.trim()).filter(Boolean)
      : [];

    const prohibitedPhrases = brand.prohibitedPhrases
      ? brand.prohibitedPhrases.split(',').map((v) => v.trim()).filter(Boolean)
      : [];

    const requiredDisclaimers = brand.requiredDisclaimers
      ? brand.requiredDisclaimers.split('\n').map((d) => d.trim()).filter(Boolean)
      : [];

    const brandColors = brand.brandColors
      ? brand.brandColors.split(',').map((c) => c.trim()).filter(Boolean)
      : ['#6366f1', '#4f46e5'];

    const competitors = brand.competitors
      ? brand.competitors.split(',').map((c) => c.trim()).filter(Boolean)
      : [];

    return {
      tenantId,
      brandId: brand.id,
      brandName: brand.name,
      industry: brand.industry,
      description: brand.description,
      products,
      targetAudience: brand.targetAudience,
      personality: brand.personality,
      tone: brand.tone,
      preferredVocabulary,
      prohibitedPhrases,
      requiredDisclaimers,
      defaultCTA: brand.defaultCTA,
      region: brand.region,
      language: brand.language,
      brandColors,
      competitors,
      groundedChunks: rankedChunks,
      documentCount: brand.knowledgeDocs.length,
      chunkCount: brand.knowledgeChunks.length,
      socialProfiles: brand.platformConnections.map((pc) => ({
        platform: pc.platform,
        accountName: pc.accountName,
        status: pc.status,
      })),
      recentCampaigns: brand.campaigns.map((c) => ({
        id: c.id,
        name: c.name,
        objective: c.objective,
        status: c.status,
      })),
      generatedAt: new Date().toISOString(),
    };
  }
}

export const brandContextPackageBuilder = new BrandContextPackageBuilder();

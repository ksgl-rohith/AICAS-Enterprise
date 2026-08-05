import { db } from '@/lib/db';

export interface PlatformExportPackage {
  exportId: string;
  tenantId: string;
  brandName: string;
  campaignName: string;
  contentItemId: string;
  platform: string;
  headline?: string;
  finalCaption: string;
  hashtags: string[];
  altText?: string;
  visualConcept?: string;
  carouselSlides?: any[];
  scheduledTime: string;
  trackingUrl: string;
  approvalStatus: string;
  evidenceReferences: any[];
  exportedAt: string;
}

export async function generateExportPackage(contentItemId: string, platform: string): Promise<PlatformExportPackage> {
  const item = await db.contentItem.findUnique({
    where: { id: contentItemId },
    include: {
      campaign: { include: { brand: true } },
      variants: true,
      reviewResult: true,
    },
  });

  if (!item) {
    throw new Error(`Content item '${contentItemId}' not found.`);
  }

  const variant = item.variants.find((v) => v.channel.toLowerCase() === platform.toLowerCase()) || item.variants[0];
  const hashtags = variant?.hashtags ? variant.hashtags.split(',').map((h) => h.trim()) : [];
  const evidenceRefs = item.reviewResult?.evidenceRefsJson ? JSON.parse(item.reviewResult.evidenceRefsJson) : [];
  const carouselSlides = variant?.carouselSlidesJson ? JSON.parse(variant.carouselSlidesJson) : undefined;

  const trackingUrl = `${process.env.APP_URL || 'http://localhost:3000'}/track/clk_${item.id.slice(-6)}?utm_source=${platform}&utm_campaign=${encodeURIComponent(item.campaign.name)}`;

  return {
    exportId: `exp_${Date.now()}_${item.id.slice(-6)}`,
    tenantId: 'tenant-default',
    brandName: item.campaign.brand.name,
    campaignName: item.campaign.name,
    contentItemId: item.id,
    platform,
    headline: variant?.headline || undefined,
    finalCaption: `${variant?.hook || ''}\n\n${variant?.bodyText || ''}\n\n${variant?.ctaText || ''}`,
    hashtags,
    altText: variant?.altText || undefined,
    visualConcept: variant?.visualConcept || undefined,
    carouselSlides,
    scheduledTime: item.createdAt.toISOString(),
    trackingUrl,
    approvalStatus: item.status,
    evidenceReferences: evidenceRefs,
    exportedAt: new Date().toISOString(),
  };
}

import { describe, expect, it } from 'vitest';
import { DomainNormalizer } from '../../src/lib/brand/domain-normalizer';
import { brandDeduplicationService } from '../../src/lib/brand/brand-deduplication-service';
import { db } from '../../src/lib/db';

describe('Brand Identity Domain Normalization & Deduplication System', () => {
  it('should normalize equivalent website URLs to identical canonical domains', () => {
    const url1 = DomainNormalizer.normalize('https://www.apexlegal.com/about?utm=1');
    const url2 = DomainNormalizer.normalize('http://apexlegal.com/');
    const url3 = DomainNormalizer.normalize('apexlegal.com');

    expect(url1?.normalizedDomain).toBe('apexlegal.com');
    expect(url2?.normalizedDomain).toBe('apexlegal.com');
    expect(url3?.normalizedDomain).toBe('apexlegal.com');
    expect(url1?.canonicalWebsiteUrl).toBe('https://apexlegal.com/about');
    expect(url2?.canonicalWebsiteUrl).toBe('http://apexlegal.com');
  });

  it('should detect exact duplicate brand profiles by normalized domain', async () => {
    const user = await db.user.findFirst();
    if (!user) return;

    // Create primary brand
    const primary = await db.brand.create({
      data: {
        userId: user.id,
        name: 'Apex Legal Advisory',
        industry: 'Legal Services',
        description: 'Corporate law advisory firm',
        products: 'Litigation',
        targetAudience: 'Corporate Counsel',
        personality: 'Authoritative',
        tone: 'Professional',
        preferredVocabulary: 'Compliance',
        prohibitedPhrases: 'Guaranteed',
        requiredDisclaimers: 'Disclaimer',
        defaultCTA: 'Consult',
        originalWebsiteUrl: 'https://www.apexlegal.com',
        canonicalWebsiteUrl: 'https://apexlegal.com',
        normalizedDomain: 'apexlegal.com',
      },
    });

    // Check duplicate detection
    const dupResult = await brandDeduplicationService.detectDuplicate(
      'tenant-default',
      'Apex Corporate Legal',
      'http://apexlegal.com/'
    );

    expect(dupResult.matchType).toBe('EXACT_DUPLICATE');
    expect(dupResult.existingBrand?.id).toBe(primary.id);
    expect(dupResult.confidence).toBeGreaterThan(0.9);

    // Clean up test primary brand
    await db.brand.delete({ where: { id: primary.id } });
  });

  it('should safely merge duplicate brands and reassign dependent campaigns', async () => {
    const user = await db.user.findFirst();
    if (!user) return;

    const b1 = await db.brand.create({
      data: {
        userId: user.id,
        name: 'Apex Legal Main',
        industry: 'Legal',
        description: 'Main',
        products: 'Legal Services',
        targetAudience: 'Execs',
        personality: 'Legal',
        tone: 'Formal',
        preferredVocabulary: 'Law',
        prohibitedPhrases: 'None',
        requiredDisclaimers: 'Disclaimer',
        defaultCTA: 'Contact',
        normalizedDomain: 'apexlegal.com',
      },
    });

    const b2 = await db.brand.create({
      data: {
        userId: user.id,
        name: 'Apex Legal Duplicate',
        industry: 'Legal',
        description: 'Duplicate',
        products: 'Legal Services',
        targetAudience: 'Execs',
        personality: 'Legal',
        tone: 'Formal',
        preferredVocabulary: 'Law',
        prohibitedPhrases: 'None',
        requiredDisclaimers: 'Disclaimer',
        defaultCTA: 'Contact',
        normalizedDomain: 'apexlegal.com',
      },
    });

    const campaign = await db.campaign.create({
      data: {
        brandId: b2.id,
        name: 'Duplicate Campaign',
        objective: 'awareness',
        productOrTopic: 'Litigation',
        description: 'Desc',
        targetAudience: 'Counsel',
        offerCTA: 'Learn',
        startDate: new Date(),
        endDate: new Date(),
        channels: 'linkedin',
      },
    });

    const mergeRes = await brandDeduplicationService.mergeBrands(
      b1.id,
      b2.id,
      'Test consolidation merge',
      'unit_test'
    );

    expect(mergeRes.success).toBe(true);
    expect(mergeRes.migratedCounts.campaigns).toBe(1);

    // Verify campaign is now linked to b1
    const updatedCampaign = await db.campaign.findUnique({ where: { id: campaign.id } });
    expect(updatedCampaign?.brandId).toBe(b1.id);

    // Verify b2 description is updated with merge note
    const archivedB2 = await db.brand.findUnique({ where: { id: b2.id } });
    expect(archivedB2?.description).toContain('[MERGED into');

    // Clean up
    await db.campaign.delete({ where: { id: campaign.id } });
    await db.brand.delete({ where: { id: b1.id } });
    await db.brand.delete({ where: { id: b2.id } });
  });
});

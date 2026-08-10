import { describe, it, expect } from 'vitest';
import { brandContextReadinessGate } from '@/lib/ai/brand-context-readiness-gate';
import { BrandContextPackage } from '@/lib/ai/brand-context-package';

describe('BrandContextReadinessGate', () => {
  it('should evaluate null brand context package as insufficient (score 0)', () => {
    const result = brandContextReadinessGate.evaluateReadiness(null);
    expect(result.readinessScore).toBe(0);
    expect(result.sufficientForGeneration).toBe(false);
    expect(result.missingFields).toContain('Brand Profile Record');
  });

  it('should evaluate incomplete brand context (missing description, products) as insufficient (< 0.70)', () => {
    const incompletePkg: BrandContextPackage = {
      tenantId: 'tenant-default',
      brandId: 'brand_test_1',
      brandName: 'Test Brand',
      industry: 'Legal Services',
      description: '',
      products: [],
      targetAudience: '',
      personality: 'Authoritative',
      tone: 'Professional',
      preferredVocabulary: [],
      prohibitedPhrases: [],
      requiredDisclaimers: [],
      defaultCTA: 'Contact Us',
      region: 'Global',
      language: 'en-US',
      brandColors: ['#6366f1'],
      competitors: [],
      groundedChunks: [],
      documentCount: 0,
      chunkCount: 0,
      socialProfiles: [],
      recentCampaigns: [],
      generatedAt: new Date().toISOString(),
    };

    const result = brandContextReadinessGate.evaluateReadiness(incompletePkg);
    expect(result.sufficientForGeneration).toBe(false);
    expect(result.readinessScore).toBeLessThan(0.70);
    expect(result.missingFields).toContain('Company Overview Description');
    expect(result.missingFields).toContain('Products / Offerings List');
  });

  it('should evaluate rich brand context package as ready (score >= 0.70)', () => {
    const completePkg: BrandContextPackage = {
      tenantId: 'tenant-default',
      brandId: 'brand_legal_1',
      brandName: 'Kandvate Legal Advisory',
      industry: 'Legal Services & Law Firm',
      description: 'Kandvate Legal Advisory is a premier law firm offering corporate dispute resolution, contract compliance, and legal counsel.',
      products: ['Corporate Advisory', 'Dispute Resolution', 'Contract Review'],
      targetAudience: 'Corporations, Enterprise Executives, Legal Officers',
      personality: 'Authoritative, Diligent, Trusted',
      tone: 'Professional, Precise',
      preferredVocabulary: ['Due Diligence', 'Corporate Advisory'],
      prohibitedPhrases: ['cheap legal hack', 'guaranteed win'],
      requiredDisclaimers: ['Disclaimer: Attorney-client consultation required.'],
      defaultCTA: 'Schedule a Legal Consultation',
      region: 'Global',
      language: 'en-US',
      brandColors: ['#4f46e5', '#1e1b4b'],
      competitors: ['Apex Law'],
      groundedChunks: [
        { chunkId: 'chk_1', documentId: 'doc_1', filename: 'Services.pdf', content: 'Comprehensive corporate legal advisory and litigation management.', score: 0.95 },
      ],
      documentCount: 1,
      chunkCount: 1,
      socialProfiles: [{ platform: 'linkedin', accountName: 'Kandvate Legal', status: 'CONNECTED' }],
      recentCampaigns: [],
      generatedAt: new Date().toISOString(),
    };

    const result = brandContextReadinessGate.evaluateReadiness(completePkg);
    expect(result.sufficientForGeneration).toBe(true);
    expect(result.readinessScore).toBeGreaterThanOrEqual(0.70);
    expect(result.missingFields.length).toBe(0);
  });
});

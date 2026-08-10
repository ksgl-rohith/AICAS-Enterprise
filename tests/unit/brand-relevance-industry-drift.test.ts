import { describe, it, expect } from 'vitest';
import { brandRelevanceGate } from '@/lib/ai/brand-relevance-gate';
import { industryDriftDetector } from '@/lib/ai/industry-drift-detector';
import { BrandContextPackage } from '@/lib/ai/brand-context-package';

describe('Brand Relevance Gate & Industry Drift Detector', () => {
  const legalBrandPkg: BrandContextPackage = {
    tenantId: 'tenant-default',
    brandId: 'brand_legal_1',
    brandName: 'Kandvate Legal Advisory',
    industry: 'Legal Services & Law Firm',
    description: 'Premier legal practice offering dispute resolution, corporate litigation, contract review, and regulatory compliance.',
    products: ['Corporate Advisory', 'Dispute Resolution', 'Contract Review'],
    targetAudience: 'Corporations, Chief Legal Officers, Business Founders',
    personality: 'Authoritative, Diligent, Trusted',
    tone: 'Professional, Precise',
    preferredVocabulary: ['Due Diligence', 'Corporate Advisory', 'Compliance'],
    prohibitedPhrases: ['cheap legal hack', 'guaranteed win'],
    requiredDisclaimers: ['Legal consultation required.'],
    defaultCTA: 'Schedule a Legal Consultation',
    region: 'Global',
    language: 'en-US',
    brandColors: ['#4f46e5'],
    competitors: [],
    groundedChunks: [
      { chunkId: 'c1', documentId: 'd1', filename: 'Overview.pdf', content: 'Corporate legal litigation and dispute resolution guidance.', score: 0.9 },
    ],
    documentCount: 1,
    chunkCount: 1,
    socialProfiles: [],
    recentCampaigns: [],
    generatedAt: new Date().toISOString(),
  };

  it('should evaluate brand relevance for legal services topic on a legal brand (score >= 0.70)', () => {
    const legalTopicText = 'Corporate Advisory & Contract Compliance: Key Legal Checklist for Businesses';
    const relevance = brandRelevanceGate.evaluateRelevance(legalTopicText, legalBrandPkg, 'brand_awareness');

    expect(['PASS', 'REVISE']).toContain(relevance.status);
    expect(relevance.overall).toBeGreaterThanOrEqual(0.70);
  });

  it('should detect and BLOCK industry drift when a legal brand receives generic multi-agent AI copy', () => {
    const leakedAiText = 'Deploying autonomous multi-agent systems and RAG vector architecture for enterprise content orchestration.';
    const driftResult = industryDriftDetector.detectDrift(leakedAiText, legalBrandPkg);

    expect(driftResult.shouldBlock).toBe(true);
    expect(driftResult.relevanceType).toBe('UNRELATED_DRIFT');
    expect(driftResult.driftScore).toBeGreaterThan(0.80);
    expect(driftResult.explanation).toContain('Legal Services');
  });

  it('should ALLOW multi-agent AI text for an AI Software brand', () => {
    const aiBrandPkg: BrandContextPackage = {
      ...legalBrandPkg,
      brandName: 'ApexAI Tech',
      industry: 'Enterprise AI Software & Technology',
      description: 'ApexAI builds multi-agent AI frameworks and vector RAG engines for enterprise automation.',
      products: ['Apex Multi-Agent Engine', 'RAG Vector Index'],
    };

    const aiText = 'Deploying autonomous multi-agent systems for enterprise content orchestration.';
    const driftResult = industryDriftDetector.detectDrift(aiText, aiBrandPkg);

    expect(driftResult.shouldBlock).toBe(false);
    expect(driftResult.relevanceType).toBe('MATCHING_INDUSTRY');
  });
});

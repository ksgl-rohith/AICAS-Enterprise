import { describe, expect, it } from 'vitest';
import { brandCriticAgent } from '../../src/lib/ai/brand-critic-agent';
import { factVerificationAgent } from '../../src/lib/ai/fact-verification-agent';
import { complianceAgent } from '../../src/lib/ai/compliance-agent';

describe('Evidence-Backed Quality Evaluation & Deterministic Overrides', () => {
  it('should compute Brand Score across 8 explicit dimensions', async () => {
    const res = await brandCriticAgent.execute({
      taskId: 'test_brand_score',
      tenantId: 'tenant-default',
      brandId: 'brand_123',
      input: {
        contentItemId: 'item_123',
        headline: 'Enterprise Legal Compliance Breakthrough',
        bodyText: 'Our corporate legal team delivers authoritative compliance strategies across corporate litigation and risk mitigation.',
        brandName: 'Apex Legal',
        personality: 'Authoritative & Innovative',
        tone: 'Professional',
        preferredVocabulary: ['Compliance', 'Litigation'],
        targetAudience: 'Corporate Counsel Executives',
      },
    });

    expect(res.output?.brandDnaScore).toBeGreaterThanOrEqual(75);
    expect(res.output?.dimensions).toBeDefined();
    expect(res.output?.dimensions?.tone).toBeGreaterThan(0);
    expect(res.output?.dimensions?.vocabulary).toBeGreaterThan(0);
  });

  it('should handle no-claim content with low factual risk and explicit rationale', async () => {
    const res = await factVerificationAgent.execute({
      taskId: 'test_fact_no_claims',
      tenantId: 'tenant-default',
      brandId: 'brand_123',
      input: {
        contentItemId: 'item_no_claims',
        textToVerify: 'In our view, we strive and hope to welcome our new partners to the annual leadership summit.',
        availableEvidence: [],
      },
    });

    expect(res.output?.factualRiskScore).toBe(0);
    expect(res.output?.overallFactualConfidence).toBe(1.0);
    expect(res.output?.rationale).toContain('No material factual claims detected');
  });

  it('should enforce deterministic BLOCK on secret leak in ComplianceAgent', async () => {
    const res = await complianceAgent.execute({
      taskId: 'test_secret_leak',
      tenantId: 'tenant-default',
      brandId: 'brand_123',
      input: {
        contentItemId: 'item_secret',
        channel: 'linkedin',
        text: 'Contact us using API key sk-live-abc123456789012345678901234567890 for immediate service.',
        prohibitedPhrases: [],
        requiredDisclaimers: [],
      },
    });

    expect(res.output?.status).toBe('block');
    expect(res.output?.deterministicHardBlock).toBe(true);
    expect(res.output?.violations.some((v) => v.code === 'ERR_SECRET_KEY')).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import { autonomyEngine } from '../../src/lib/governance/autonomy-engine';
import { db } from '../../src/lib/db';

describe('Controlled Autonomy Engine & Governance Policies', () => {
  it('should block autonomous publishing when ENABLE_AUTONOMOUS_PUBLISHING is false', async () => {
    const res = await autonomyEngine.evaluatePublishingAutonomy({
      tenantId: 'tenant-default',
      brandId: 'brand_test_1',
      contentItemId: 'item_001',
      oversightMode: 'AUTONOMOUS_CAMPAIGN',
      riskScore: 10,
      factualConfidence: 0.95,
      brandScore: 92,
      duplicateSimilarity: 0.05,
      contentType: 'text_post',
      connectorStatus: 'CONNECTED',
      availableBudget: true,
      isFeatureFlagEnabled: false,
    });

    expect(res.canAutoPublish).toBe(false);
    expect(res.requiresHumanApproval).toBe(true);
    expect(res.reasons.some((r) => r.includes('ENABLE_AUTONOMOUS_PUBLISHING'))).toBe(true);
  });

  it('should enforce crisis pause override when active crisis pause exists', async () => {
    const brandId = `brand_crisis_${Date.now()}`;
    await db.crisisPauseLog.create({
      data: {
        tenantId: 'tenant-default',
        brandId,
        action: 'PAUSED',
        reason: 'PR vulnerability review in progress',
        initiatedBy: 'VP of Communications',
      },
    });

    const res = await autonomyEngine.evaluatePublishingAutonomy({
      tenantId: 'tenant-default',
      brandId,
      contentItemId: 'item_crisis_001',
      oversightMode: 'RISK_BASED',
      riskScore: 5,
      factualConfidence: 0.98,
      brandScore: 95,
      duplicateSimilarity: 0.0,
      contentType: 'text_post',
      connectorStatus: 'CONNECTED',
      availableBudget: true,
    });

    expect(res.canAutoPublish).toBe(false);
    expect(res.reasons.some((r) => r.includes('active Crisis Pause'))).toBe(true);
  });
});

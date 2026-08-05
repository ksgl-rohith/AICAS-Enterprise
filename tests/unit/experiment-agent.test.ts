import { describe, it, expect } from 'vitest';
import { experimentAgent } from '../../src/lib/ai/experiment-agent';
import { createBaseTask } from '../../src/lib/ai/agent-contract';

describe('ExperimentAgent & Deterministic Variant Assignment', () => {
  it('should generate controlled experiment design and enforce single-dimension control', async () => {
    const task = createBaseTask('tenant-default', 'brand_test_1', {
      brandId: 'brand_test_1',
      hypothesis: 'Question hooks generate higher 3s engagement than statement hooks.',
      primaryMetric: 'ctr',
    });

    const res = await experimentAgent.execute(task);
    expect(res.status).toBe('completed');
    expect(res.output?.primaryMetric).toBe('ctr');
    expect(res.output?.variants.length).toBeLessThanOrEqual(3);
  });

  it('should reject automatic experiment generation for high-risk content', async () => {
    const task = createBaseTask('tenant-default', 'brand_test_1', {
      brandId: 'brand_test_1',
      hypothesis: 'Test medical claims in variant B.',
      primaryMetric: 'conversionRate',
      isHighRiskContent: true,
    });

    await expect(experimentAgent.execute(task)).rejects.toThrow('High-risk content is excluded');
  });

  it('should guarantee deterministic variant assignment for subject IDs', async () => {
    const experimentId = `exp_unit_${Date.now()}`;
    const tenantId = 'tenant-default';
    const userId = 'user_visitor_998822';

    // Seed mock experiment in DB
    const { db } = await import('../../src/lib/db');
    await db.experiment.create({
      data: {
        id: experimentId,
        tenantId,
        brandId: 'brand_test_1',
        name: 'Deterministic Unit Test Exp',
        hypothesis: 'Test hash consistency',
        primaryMetric: 'ctr',
        guardrailMetricsJson: '[]',
        targetPopulation: 'All',
        variantsJson: JSON.stringify([
          { variantId: 'var_A', weight: 0.5 },
          { variantId: 'var_B', weight: 0.5 },
        ]),
        startRulesJson: '{}',
        stopRulesJson: '{}',
      },
    });

    const variant1 = await experimentAgent.getOrAssignVariant(experimentId, tenantId, userId);
    const variant2 = await experimentAgent.getOrAssignVariant(experimentId, tenantId, userId);
    expect(variant1).toBe(variant2);
  });
});

import { describe, it, expect } from 'vitest';
import { optimizationAgent } from '../../src/lib/ai/optimization-agent';
import { learningMemoryService } from '../../src/lib/analytics/learning-memory';
import { createBaseTask } from '../../src/lib/ai/agent-contract';

describe('Optimization Agent & Recommendation Lifecycle', () => {
  it('should generate recommendation with explicit source attribution and evidence', async () => {
    const task = createBaseTask('tenant-default', 'brand_test_1', {
      brandId: 'brand_test_1',
    });

    const res = await optimizationAgent.execute(task);
    expect(res.status).toBe('completed');
    expect(res.output?.source).toBeDefined();
    expect(res.output?.confidence).toBeGreaterThanOrEqual(0.70);
  });

  it('should transition recommendation lifecycle states and enforce memory protection', async () => {
    const runId = Date.now();
    const transition = await optimizationAgent.transitionRecommendationLifecycle(
      `rec_${runId}`,
      'approved',
      'reviewer_admin'
    );
    expect(transition.currentState).toBe('approved');

    // Create learning memory item and verify approval transition
    const memoryItem = await learningMemoryService.createLearningItem({
      tenantId: 'tenant-default',
      brandId: 'brand_test_1',
      learnedPreference: 'Question hooks outperform static text hooks by +120%',
      supportingEvidence: ['exp_01'],
      confidence: 0.92,
      scope: { tenantId: 'tenant-default', brandId: 'brand_test_1' },
      status: 'PROPOSED',
    });

    const approvedPolicy = await learningMemoryService.approvePolicy(memoryItem.id, 'reviewer_admin');
    expect(approvedPolicy.status).toBe('APPROVED_LEARNED_POLICY');
  });
});

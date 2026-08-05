import { describe, it, expect } from 'vitest';
import { costGovernanceAgent } from '../../src/lib/ai/cost-governance-agent';
import { modelGateway } from '../../src/lib/ai/model-gateway';
import { createBaseTask } from '../../src/lib/ai/agent-contract';
import { db } from '../../src/lib/db';

describe('Cost Governance Agent & Budget Enforcement', () => {
  it('should select economy tier model for low complexity and low risk tasks', async () => {
    const task = createBaseTask('tenant-default', 'brand_test_1', {
      taskComplexity: 'LOW' as const,
      riskCategory: 'LOW' as const,
    });

    const res = await costGovernanceAgent.execute(task);
    expect(res.status).toBe('completed');
    expect(res.output?.selectedModelTier).toBe('ECONOMY');
  });

  it('should require approval for high-cost media generation when configured', async () => {
    const task = createBaseTask('tenant-default', 'brand_test_1', {
      taskComplexity: 'MEDIUM' as const,
      riskCategory: 'NORMAL' as const,
      isMediaGeneration: true,
      estimatedMediaCostUsd: 5.0,
    });

    const res = await costGovernanceAgent.execute(task);
    expect(res.output?.requiresMediaApproval).toBe(true);
  });

  it('should block execution when tenant budget is exhausted', async () => {
    const tenantId = `tenant_exhausted_${Date.now()}`;
    await db.costBudget.create({
      data: {
        tenantId,
        monthlyBudgetUsd: 50.0,
        spentUsd: 55.0, // Exhausted
      },
    });

    const task = createBaseTask(tenantId, 'brand_test_1', {
      taskComplexity: 'HIGH' as const,
      riskCategory: 'HIGH' as const,
    });

    const res = await costGovernanceAgent.execute(task);
    expect(res.status).toBe('blocked');
    expect(res.output?.approved).toBe(false);
  });
});

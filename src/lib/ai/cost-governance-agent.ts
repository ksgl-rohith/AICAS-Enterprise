import { db } from '@/lib/db';
import { AgentResult, AgentTask } from './agent-contract';
import { z } from 'zod';
import { modelGateway } from './model-gateway';

export const CostDecisionSchema = z.object({
  approved: z.boolean(),
  selectedModelTier: z.enum(['ECONOMY', 'STANDARD', 'PREMIUM']),
  recommendedModelName: z.string(),
  estimatedCostUsd: z.number(),
  remainingMonthlyBudgetUsd: z.number(),
  cacheRecommended: z.boolean(),
  requiresMediaApproval: z.boolean(),
  explanation: z.string(),
});

export type CostDecisionOutput = z.infer<typeof CostDecisionSchema>;

export interface CostDecisionInput {
  taskComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
  riskCategory: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  latencyRequirementMs?: number;
  qualityThreshold?: number; // 0.0 - 1.0
  isMediaGeneration?: boolean;
  estimatedMediaCostUsd?: number;
  campaignId?: string;
}

export class CostGovernanceAgent {
  public async execute(
    task: AgentTask<CostDecisionInput>
  ): Promise<AgentResult<CostDecisionOutput>> {
    const startTime = Date.now();
    const tenantId = task.tenantId || 'tenant-default';

    // 1. Fetch Tenant Cost Budget
    let budget = await db.costBudget.findUnique({ where: { tenantId } });
    if (!budget) {
      budget = await db.costBudget.create({
        data: {
          tenantId,
          monthlyBudgetUsd: 500.0,
          campaignBudgetUsd: 100.0,
          spentUsd: 0.0,
        },
      });
    }

    const remainingBudget = Math.max(0, budget.monthlyBudgetUsd - budget.spentUsd);

    // 2. Select Model Tier based on complexity, risk, latency requirement & budget
    let selectedTier: 'ECONOMY' | 'STANDARD' | 'PREMIUM' = 'STANDARD';
    let modelName = 'gemini-1.5-flash';

    if (task.input.taskComplexity === 'LOW' && task.input.riskCategory === 'LOW') {
      selectedTier = 'ECONOMY';
      modelName = 'gpt-4o-mini';
    } else if (task.input.taskComplexity === 'HIGH' || task.input.riskCategory === 'CRITICAL') {
      selectedTier = 'PREMIUM';
      modelName = 'gpt-4o';
    }

    // 3. High-cost media approval configuration check
    const requireMediaApprovalConfig = process.env.REQUIRE_MEDIA_APPROVAL === 'true';
    const isMedia = task.input.isMediaGeneration === true;
    const mediaCost = task.input.estimatedMediaCostUsd || 0.50;
    const requiresMediaApproval = isMedia && (requireMediaApprovalConfig || mediaCost > 2.0);

    // 4. Semantic cache recommendation
    const cacheRecommended = task.input.taskComplexity === 'LOW' || remainingBudget < 50.0;

    // 5. Budget enforcement
    const isBudgetAvailable = remainingBudget >= (isMedia ? mediaCost : 0.01);
    const approved = isBudgetAvailable && (!requiresMediaApproval || !isMedia);

    const estimatedCost = isMedia ? mediaCost : modelGateway.calculateTokenCost(modelName, 1000);

    const explanation = !isBudgetAvailable
      ? `Budget exceeded for tenant ${tenantId}. Remaining monthly budget: $${remainingBudget.toFixed(2)}, required: $${estimatedCost.toFixed(2)}.`
      : requiresMediaApproval
      ? `High-cost media generation ($${mediaCost.toFixed(2)}) requires explicit manager approval before rendering.`
      : `Approved ${selectedTier} tier execution using ${modelName}. Estimated cost: $${estimatedCost.toFixed(3)}.`;

    const output: CostDecisionOutput = {
      approved,
      selectedModelTier: selectedTier,
      recommendedModelName: modelName,
      estimatedCostUsd: estimatedCost,
      remainingMonthlyBudgetUsd: remainingBudget,
      cacheRecommended,
      requiresMediaApproval,
      explanation,
    };

    return {
      taskId: task.taskId,
      status: approved ? 'completed' : 'blocked',
      output,
      confidence: 1.0,
      warnings: approved ? [] : [explanation],
      evidence: [],
      usage: {
        latencyMs: Date.now() - startTime,
        estimatedTokens: 50,
      },
      provenance: {
        model: 'deterministic-cost-policy',
        promptVersion: 'v1.0',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const costGovernanceAgent = new CostGovernanceAgent();

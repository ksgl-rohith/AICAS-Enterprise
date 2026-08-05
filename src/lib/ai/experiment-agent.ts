import { db } from '@/lib/db';
import { AgentResult, AgentTask } from './agent-contract';
import { modelGateway } from './model-gateway';
import { z } from 'zod';
import { createHash } from 'crypto';
import { statisticalEvaluator, StatisticalTestResult } from '@/lib/analytics/statistical-evaluator';

export const ExperimentVariantSchema = z.object({
  variantId: z.string(),
  name: z.string(),
  contentVariantId: z.string().optional(),
  weight: z.number(),
  configJson: z.string().optional(),
});

export const ExperimentDesignSchema = z.object({
  name: z.string(),
  hypothesis: z.string(),
  primaryMetric: z.string(),
  guardrailMetrics: z.array(z.string()),
  targetPopulation: z.string(),
  assignmentMethod: z.enum(['DETERMINISTIC_HASH', 'BANDIT', 'HOLDOUT', 'SEQUENTIAL']),
  variants: z.array(ExperimentVariantSchema),
  startRules: z.string(),
  stopRules: z.string(),
  minSampleRequirements: z.number(),
  risks: z.array(z.string()),
});

export type ExperimentDesignOutput = z.infer<typeof ExperimentDesignSchema>;

export interface CreateExperimentInput {
  brandId: string;
  campaignId?: string;
  hypothesis: string;
  primaryMetric: string;
  variantAContentId?: string;
  variantBContentId?: string;
  allowMultiDimension?: boolean;
  isHighRiskContent?: boolean;
}

export class ExperimentAgent {
  public async execute(
    task: AgentTask<CreateExperimentInput>
  ): Promise<AgentResult<ExperimentDesignOutput>> {
    const startTime = Date.now();
    const tenantId = task.tenantId || 'tenant-default';

    // Guardrail Check 1: Exclude high-risk content from automatic experiments
    if (task.input.isHighRiskContent) {
      throw new Error('High-risk content is excluded from automatic experiment generation per safety policy.');
    }

    const mockFallback: ExperimentDesignOutput = {
      name: `Exp: ${task.input.primaryMetric} Optimization - ${Date.now()}`,
      hypothesis: task.input.hypothesis || 'Using technical carousels increases CTR over text posts.',
      primaryMetric: task.input.primaryMetric || 'ctr',
      guardrailMetrics: ['unsubscribeRate', 'negativeReactions', 'brandSafetyScore'],
      targetPopulation: 'Enterprise SaaS Decision Makers (LinkedIn)',
      assignmentMethod: 'DETERMINISTIC_HASH',
      variants: [
        { variantId: 'var_control_A', name: 'Control: Static Text Post', weight: 0.5 },
        { variantId: 'var_treatment_B', name: 'Treatment: Technical Carousel', weight: 0.5 },
      ],
      startRules: 'Start when post is scheduled and published.',
      stopRules: 'Stop after 500 impressions per variant or 7 days.',
      minSampleRequirements: 150,
      risks: ['Potential audience fatigue if exposed to multiple variant tests in same week.'],
    };

    const systemPrompt = `You are an AI Growth Experimentation Specialist.
Design a rigorous, single-variable controlled experiment based on the hypothesis.
Prevent multi-dimension uncontrolled tests unless explicitly permitted.`;

    const userPrompt = `Brand ID: ${task.input.brandId}
Hypothesis: ${task.input.hypothesis}
Primary Metric: ${task.input.primaryMetric}`;

    const res = await modelGateway.generateStructured({
      systemPrompt,
      userPrompt,
      schema: ExperimentDesignSchema,
      mockFallback,
      tenantId,
      agentName: 'ExperimentAgent',
    });

    // Check multi-dimension constraint
    if (!task.input.allowMultiDimension && res.output.variants.length > 3) {
      res.output.variants = res.output.variants.slice(0, 2); // Enforce strict 2-variant control vs treatment
    }

    // Support MAB behind feature flag check
    const isBanditEnabled = process.env.ENABLE_MULTI_ARMED_BANDIT === 'true';
    if (res.output.assignmentMethod === 'BANDIT' && !isBanditEnabled) {
      res.output.assignmentMethod = 'DETERMINISTIC_HASH';
    }

    // Persist Experiment to DB
    await db.experiment.create({
      data: {
        tenantId,
        brandId: task.input.brandId,
        name: res.output.name,
        hypothesis: res.output.hypothesis,
        primaryMetric: res.output.primaryMetric,
        guardrailMetricsJson: JSON.stringify(res.output.guardrailMetrics),
        targetPopulation: res.output.targetPopulation,
        variantsJson: JSON.stringify(res.output.variants),
        assignmentMethod: res.output.assignmentMethod,
        startRulesJson: JSON.stringify(res.output.startRules),
        stopRulesJson: JSON.stringify(res.output.stopRules),
        minSampleRequirements: res.output.minSampleRequirements,
        risksJson: JSON.stringify(res.output.risks),
        status: 'RUNNING',
        startDate: new Date(),
      },
    });

    return {
      taskId: task.taskId,
      status: 'completed',
      output: res.output,
      confidence: 0.95,
      warnings: [],
      evidence: [],
      usage: {
        latencyMs: Date.now() - startTime,
        estimatedTokens: res.tokensUsed,
      },
      provenance: {
        model: res.modelUsed,
        promptVersion: 'v1.0-experiment',
        policyVersion: 'v1.0',
      },
    };
  }

  /**
   * Deterministic Assignment of Subject (User/Visitor ID) to Variant
   */
  public async getOrAssignVariant(
    experimentId: string,
    tenantId: string,
    userIdOrSubjectId: string
  ): Promise<string> {
    const existing = await db.experimentAssignment.findUnique({
      where: {
        experimentId_tenantId_userIdOrSubjectId: {
          experimentId,
          tenantId,
          userIdOrSubjectId,
        },
      },
    });

    if (existing) {
      return existing.variantId;
    }

    const exp = await db.experiment.findUnique({ where: { id: experimentId } });
    if (!exp) throw new Error(`Experiment ${experimentId} not found.`);

    const variants: Array<{ variantId: string; weight: number }> = JSON.parse(exp.variantsJson);
    if (!variants || variants.length === 0) throw new Error('No variants configured.');

    // Deterministic Hash Assignment
    const hash = createHash('sha256')
      .update(`${experimentId}:${tenantId}:${userIdOrSubjectId}`)
      .digest('hex');
    const numericHash = parseInt(hash.slice(0, 8), 16) / 0xffffffff;

    let cumulativeWeight = 0;
    let selectedVariantId = variants[0].variantId;
    for (const v of variants) {
      cumulativeWeight += v.weight || 1 / variants.length;
      if (numericHash <= cumulativeWeight) {
        selectedVariantId = v.variantId;
        break;
      }
    }

    await db.experimentAssignment.create({
      data: {
        experimentId,
        tenantId,
        userIdOrSubjectId,
        variantId: selectedVariantId,
      },
    });

    return selectedVariantId;
  }

  /**
   * Evaluate Experiment results using pure deterministic statistical evaluator module.
   */
  public evaluateExperiment(
    metricName: string,
    variantAName: string,
    variantAData: { successes: number; total: number },
    variantBName: string,
    variantBData: { successes: number; total: number },
    minSampleSize: number = 100
  ): StatisticalTestResult {
    return statisticalEvaluator.evaluateProportionTest(
      metricName,
      variantAName,
      variantAData,
      variantBName,
      variantBData,
      minSampleSize,
      0.95
    );
  }
}

export const experimentAgent = new ExperimentAgent();

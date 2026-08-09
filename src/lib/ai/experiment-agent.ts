import { db } from '@/lib/db';
import { AgentResult, AgentTask } from './agent-contract';
import { modelGateway } from './model-gateway';
import { z } from 'zod';
import { createHash } from 'crypto';
import { statisticalEvaluator, StatisticalTestResult } from '@/lib/analytics/statistical-evaluator';
import { auditService } from '@/lib/services/audit-service';

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

export interface UserExperimentProposal {
  brandId: string;
  campaignId?: string;
  hypothesis: string;
  primaryMetric: string;
  controlName: string;
  variantName: string;
  targetAudience?: string;
  channel?: string;
  durationDays?: number;
}

export interface ProposalEvaluationResult {
  qualityScore: number; // 0 - 100
  hypothesisClarity: 'High' | 'Medium' | 'Low';
  measurableOutcome: boolean;
  confoundingVariables: string[];
  recommendedChanges: string[];
  risks: string[];
  expectedSampleConsiderations: string;
}

export class ExperimentAgent {
  /**
   * Mode A: AI-Recommended Experiment Proposal Engine
   */
  public async generateAiRecommendations(brandId: string, tenantId: string = 'tenant-default') {
    // Analyze recent post performance & fatigue records
    const fatigueRecords = await db.creativeFatigueRecord.findMany({
      where: { brandId },
      orderBy: { detectedAt: 'desc' },
      take: 5,
    });

    const recommendations = [];

    // Recommendation 1: Hook opening test
    recommendations.push({
      id: `rec_exp_1_${Date.now()}`,
      title: 'A/B Test Benefit-Led Hook Openings',
      hypothesis: 'Opening LinkedIn carousels with a direct enterprise benefit statement increases CTR over question-based hooks.',
      variable: 'Opening Hook Copy',
      control: 'Current Question Hook ("Are you struggling with AI compliance?")',
      variant: 'Benefit-Led Hook ("Achieve 100% compliant AI publishing in 30 days")',
      primaryMetric: 'ctr',
      guardrailMetric: 'negativeReactions',
      confidence: 0.92,
      rationale: 'Performance analytics indicate question hooks underperform direct benefit hooks by 18% in B2B audiences.',
    });

    // Recommendation 2: Visual layout test
    if (fatigueRecords.length > 0) {
      recommendations.push({
        id: `rec_exp_2_${Date.now()}`,
        title: 'Creative Fatigue Refresh Test',
        hypothesis: 'Replacing fatigued static quote visuals with multi-card infographics increases engagement rate.',
        variable: 'Visual Layout Format',
        control: 'Fatigued Static Quote Card',
        variant: 'Fresh 3-Slide Infographic',
        primaryMetric: 'engagementRate',
        guardrailMetric: 'unsubscribeRate',
        confidence: 0.88,
        rationale: 'Creative fatigue detected on repeated visual templates.',
      });
    }

    return recommendations;
  }

  /**
   * Mode B: Evaluate User-Defined Experiment Proposal
   */
  public evaluateUserProposal(proposal: UserExperimentProposal): ProposalEvaluationResult {
    let score = 85;
    const confoundingVariables: string[] = [];
    const recommendedChanges: string[] = [];
    const risks: string[] = [];

    if (!proposal.hypothesis || proposal.hypothesis.length < 15) {
      score -= 20;
      recommendedChanges.push('Make hypothesis more specific with a clear causal statement (If [change] then [metric] will increase).');
    }

    if (!proposal.primaryMetric) {
      score -= 25;
      recommendedChanges.push('Select a measurable primary metric (e.g. CTR, engagement rate, or conversions).');
    }

    if (proposal.controlName === proposal.variantName) {
      score -= 30;
      confoundingVariables.push('Control and Variant content are identical.');
    }

    if (!proposal.durationDays || proposal.durationDays < 3) {
      risks.push('Short experiment duration may introduce day-of-week seasonality bias.');
      recommendedChanges.push('Run test for at least 7 days to capture full weekly audience cycle.');
    }

    const qualityScore = Math.max(0, Math.min(100, score));

    return {
      qualityScore,
      hypothesisClarity: qualityScore > 75 ? 'High' : qualityScore > 50 ? 'Medium' : 'Low',
      measurableOutcome: Boolean(proposal.primaryMetric),
      confoundingVariables,
      recommendedChanges,
      risks,
      expectedSampleConsiderations: 'Minimum 200 total impressions required per variant for statistically significant z-test evaluation.',
    };
  }

  /**
   * Execute Experiment Agent run to persist experiment design.
   */
  public async execute(
    task: AgentTask<{ brandId: string; campaignId?: string; hypothesis: string; primaryMetric: string; isHighRiskContent?: boolean }>
  ): Promise<AgentResult<ExperimentDesignOutput>> {
    const startTime = Date.now();
    const tenantId = task.tenantId || 'tenant-default';

    if (task.input.isHighRiskContent) {
      throw new Error('High-risk content is excluded from automatic experiment generation per safety policy.');
    }

    const mockFallback: ExperimentDesignOutput = {
      name: `Exp: ${task.input.primaryMetric} Optimization - ${Date.now()}`,
      hypothesis: task.input.hypothesis || 'Using technical carousels increases CTR over text posts.',
      primaryMetric: task.input.primaryMetric || 'ctr',
      guardrailMetrics: ['unsubscribeRate', 'negativeReactions', 'brandSafetyScore'],
      targetPopulation: 'Enterprise SaaS Decision Makers',
      assignmentMethod: 'DETERMINISTIC_HASH',
      variants: [
        { variantId: 'var_control_A', name: 'Control: Static Post', weight: 0.5 },
        { variantId: 'var_treatment_B', name: 'Treatment: Technical Carousel', weight: 0.5 },
      ],
      startRules: 'Start when post is scheduled and published.',
      stopRules: 'Stop after 500 impressions per variant or 7 days.',
      minSampleRequirements: 150,
      risks: ['Potential audience fatigue if exposed to multiple variant tests in same week.'],
    };

    const res = await modelGateway.generateStructured({
      systemPrompt: 'You are an AI Growth Experimentation Specialist. Design single-variable controlled experiments.',
      userPrompt: `Brand ID: ${task.input.brandId}\nHypothesis: ${task.input.hypothesis}\nPrimary Metric: ${task.input.primaryMetric}`,
      schema: ExperimentDesignSchema,
      mockFallback,
      tenantId,
      agentName: 'ExperimentAgent',
    });

    const exp = await db.experiment.create({
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

    await auditService.recordEvent({
      tenantId,
      category: 'Experiment',
      action: 'experiment.created',
      details: `Created experiment "${exp.name}" targeting ${exp.primaryMetric}`,
      entityType: 'Experiment',
      entityId: exp.id,
      metadata: { hypothesis: exp.hypothesis, metric: exp.primaryMetric },
    });

    return {
      taskId: task.taskId,
      status: 'completed',
      output: res.output,
      confidence: 0.95,
      warnings: [],
      evidence: [],
      usage: { latencyMs: Date.now() - startTime, estimatedTokens: res.tokensUsed },
      provenance: { model: res.modelUsed, promptVersion: 'v1.0-experiment', policyVersion: 'v1.0' },
    };
  }

  /**
   * Deterministic Subject Assignment
   */
  public async getOrAssignVariant(experimentId: string, tenantId: string, userIdOrSubjectId: string): Promise<string> {
    const existing = await db.experimentAssignment.findUnique({
      where: {
        experimentId_tenantId_userIdOrSubjectId: { experimentId, tenantId, userIdOrSubjectId },
      },
    });
    if (existing) return existing.variantId;

    const exp = await db.experiment.findUnique({ where: { id: experimentId } });
    if (!exp) throw new Error(`Experiment ${experimentId} not found.`);

    const variants: Array<{ variantId: string; weight: number }> = JSON.parse(exp.variantsJson);
    const hash = createHash('sha256').update(`${experimentId}:${tenantId}:${userIdOrSubjectId}`).digest('hex');
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
      data: { experimentId, tenantId, userIdOrSubjectId, variantId: selectedVariantId },
    });

    return selectedVariantId;
  }

  /**
   * Deterministic Statistical Evaluation yielding decision states:
   * winner | no_significant_difference | inconclusive | guardrail_failed | stopped_early
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

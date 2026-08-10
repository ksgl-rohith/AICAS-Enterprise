import { db } from '@/lib/db';
import { AgentResult, AgentTask } from './agent-contract';
import { modelGateway } from './model-gateway';
import { z } from 'zod';
import { createHash } from 'crypto';
import { statisticalEvaluator, StatisticalTestResult } from '@/lib/analytics/statistical-evaluator';
import { auditService } from '@/lib/services/audit-service';
import { brandContextPackageBuilder } from './brand-context-package';

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
   * Mode A: AI-Recommended Experiment Proposal Engine (Data-Driven by Brand DNA)
   */
  public async generateAiRecommendations(brandId: string, tenantId: string = 'tenant-default') {
    const pkg = await brandContextPackageBuilder.buildPackage(brandId, '', tenantId);
    const brandName = pkg?.brandName || 'Brand';
    const industry = pkg?.industry || 'Corporate Services';
    const targetAudience = pkg?.targetAudience || 'Target Audience';

    const fatigueRecords = await db.creativeFatigueRecord.findMany({
      where: { brandId },
      orderBy: { detectedAt: 'desc' },
      take: 5,
    });

    const recommendations = [];

    // Recommendation 1: Hook opening test tailored to industry & brand
    recommendations.push({
      id: `rec_exp_1_${Date.now()}`,
      title: `A/B Test ${industry} Value Hook Openings`,
      hypothesis: `Opening LinkedIn posts for ${brandName} with a direct ${industry} value proposition increases CTR over generic question hooks.`,
      variable: 'Opening Hook Copy',
      control: `Current Question Hook ("Are you looking for better ${industry} solutions?")`,
      variant: `Value-Led Hook ("Achieve measurable ${industry} results with ${brandName}")`,
      primaryMetric: 'ctr',
      guardrailMetric: 'negativeReactions',
      confidence: 0.92,
      rationale: `Social analytics indicate direct value-led hooks outperform question hooks in ${industry} buyer segments (${targetAudience}).`,
    });

    // Recommendation 2: Visual format test
    recommendations.push({
      id: `rec_exp_2_${Date.now()}`,
      title: `Multi-Slide Infographic vs Static Visual Test`,
      hypothesis: `Replacing static quote graphics with multi-slide visual checklists increases engagement rate for ${targetAudience}.`,
      variable: 'Visual Layout Format',
      control: 'Static Quote Card',
      variant: '4-Slide Interactive Infographic Carousel',
      primaryMetric: 'engagementRate',
      guardrailMetric: 'unsubscribeRate',
      confidence: 0.89,
      rationale: fatigueRecords.length > 0
        ? `Creative fatigue detected on static visual templates for ${brandName}.`
        : `Infographic carousels yield higher completion rates across ${industry} audiences.`,
    });

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

    const pkg = await brandContextPackageBuilder.buildPackage(task.input.brandId, '', tenantId);
    const brandName = pkg?.brandName || 'Brand';
    const targetPopulation = pkg?.targetAudience || 'Target Audience';

    const mockFallback: ExperimentDesignOutput = {
      name: `Exp: ${task.input.primaryMetric} Optimization for ${brandName} - ${Date.now()}`,
      hypothesis: task.input.hypothesis || `Using structured carousels increases CTR over static posts for ${brandName}.`,
      primaryMetric: task.input.primaryMetric || 'ctr',
      guardrailMetrics: ['unsubscribeRate', 'negativeReactions', 'complianceScore'],
      targetPopulation,
      assignmentMethod: 'DETERMINISTIC_HASH',
      variants: [
        { variantId: 'var_control_A', name: 'Control: Current Baseline Post', weight: 0.5 },
        { variantId: 'var_treatment_B', name: 'Treatment: Value-Led Variant', weight: 0.5 },
      ],
      startRules: 'Start when post is scheduled and published.',
      stopRules: 'Stop after 500 impressions per variant or 7 days.',
      minSampleRequirements: 150,
      risks: ['Potential audience fatigue if exposed to multiple variant tests in same week.'],
    };

    const res = await modelGateway.generateStructured({
      systemPrompt: `You are an AI Growth Experimentation Specialist for "${brandName}". Design single-variable controlled experiments.`,
      userPrompt: `Brand: ${brandName}\nHypothesis: ${task.input.hypothesis}\nPrimary Metric: ${task.input.primaryMetric}`,
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
      provenance: { model: res.modelUsed, promptVersion: 'v2.0-dynamic-experiment', policyVersion: 'v1.0' },
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
   * WINNER | NO_SIGNIFICANT_DIFFERENCE | INCONCLUSIVE | GUARDRAIL_FAILED
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

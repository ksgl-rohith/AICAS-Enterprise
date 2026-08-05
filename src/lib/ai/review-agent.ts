import { db } from '@/lib/db';
import { AgentResult, AgentTask, EvidenceReference } from './agent-contract';
import { brandContextAgent } from './brand-context-agent';
import { factVerificationAgent, FactVerificationOutput } from './fact-verification-agent';
import { complianceAgent, ComplianceOutput } from './compliance-agent';
import { brandCriticAgent, BrandCriticOutput } from './brand-critic-agent';
import { accessibilityAgent, AccessibilityOutput } from './accessibility-agent';
import { seoDiscoveryAgent, SeoDiscoveryOutput } from './seo-discovery-agent';
import { EvidenceRecord } from './evidence-model';
import { agentRegistry } from './agent-registry';

export interface QualityCouncilThresholds {
  minBrandScore: number;            // default 75
  minFactualConfidence: number;     // default 0.8
  maxFactualRisk: number;           // default 30
  maxDuplicateSimilarity: number;  // default 0.35
  mandatoryAccessibility: boolean;  // default true
  mandatoryHumanReviewCategories?: string[];
}

export interface ReviewInput {
  contentItemId: string;
  brandId: string;
  thresholds?: Partial<QualityCouncilThresholds>;
}

export interface QualityCouncilDetails {
  factVerification?: FactVerificationOutput;
  compliance?: ComplianceOutput;
  brandCritic?: BrandCriticOutput;
  accessibility?: AccessibilityOutput;
  seoDiscovery?: SeoDiscoveryOutput;
  blockingReasons: string[];
  revisionInstructions: string[];
  humanEscalationRequired: boolean;
  humanEscalationReason?: string;
}

export interface ReviewOutput {
  brandScore: number;          // 0-100
  factualRiskScore: number;    // 0-100 (lower is safer)
  complianceScore: number;     // 0-100
  originalityScore: number;    // 0-100
  readabilityScore: number;    // 0-100
  overallStatus: 'passed' | 'needs_revision' | 'blocked';
  warnings: string[];
  corrections: string[];
  evidence: (EvidenceRecord | EvidenceReference)[];
  prohibitedTermsFound: string[];
  missingDisclaimers: string[];
  duplicateSimilarity: number;
  qualityCouncilDetails?: QualityCouncilDetails;
}

export class ReviewAgent {
  public async execute(task: AgentTask<ReviewInput>): Promise<AgentResult<ReviewOutput>> {
    const startTime = Date.now();
    const { contentItemId, brandId, thresholds: customThresholds } = task.input;

    const thresholds: QualityCouncilThresholds = {
      minBrandScore: customThresholds?.minBrandScore ?? 75,
      minFactualConfidence: customThresholds?.minFactualConfidence ?? 0.8,
      maxFactualRisk: customThresholds?.maxFactualRisk ?? 30,
      maxDuplicateSimilarity: customThresholds?.maxDuplicateSimilarity ?? 0.35,
      mandatoryAccessibility: customThresholds?.mandatoryAccessibility ?? true,
      mandatoryHumanReviewCategories: customThresholds?.mandatoryHumanReviewCategories ?? [],
    };

    // 1. Fetch content item & variants
    const contentItem = await db.contentItem.findUnique({
      where: { id: contentItemId },
      include: {
        variants: true,
      },
    });

    if (!contentItem) {
      return {
        taskId: task.taskId,
        agentName: 'QualityCouncil',
        status: 'failed',
        confidence: 0,
        warnings: ['Content item not found'],
        evidence: [],
      };
    }

    // 2. Fetch Brand Context
    const brandCtx = await brandContextAgent.execute({
      taskId: `${task.taskId}_brand`,
      tenantId: task.tenantId || 'tenant-default',
      brandId: brandId,
      input: { brandId: brandId, query: contentItem.title },
    });

    const prohibitedPhrases = brandCtx.output?.prohibitedPhrases || [];
    const requiredDisclaimers = brandCtx.output?.requiredDisclaimers || [];
    const evidencePack: EvidenceRecord[] = brandCtx.output?.groundedChunks?.map((chunk, idx) => ({
      evidenceId: `ev_${chunk.chunkId || idx}`,
      sourceId: chunk.chunkId || `doc_${idx}`,
      sourceTitle: chunk.filename || 'Brand Knowledge Document',
      sourceType: 'document',
      retrievedExcerpt: chunk.content,
      retrievalDate: new Date().toISOString(),
      trustLevel: 'VERIFIED_INTERNAL',
      tenantId: task.tenantId || 'tenant-default',
      brandId: brandId,
      chunkId: chunk.chunkId,
      confidence: 0.95,
    })) || [];

    // Combine variant texts
    const primaryVariant = contentItem.variants[0];
    const fullContentText = contentItem.variants
      .map((v) => `${v.hook} ${v.bodyText} ${v.ctaText}`)
      .join(' ');
    const channel = (primaryVariant?.channel || 'linkedin') as 'linkedin' | 'facebook' | 'instagram' | 'telegram';

    // 3. Execute Independent Council Reviewers in Parallel
    const [factRes, complianceRes, brandRes, accessRes, seoRes] = await Promise.all([
      factVerificationAgent.execute({
        taskId: `${task.taskId}_fact`,
        tenantId: task.tenantId || 'tenant-default',
        brandId,
        input: {
          contentItemId,
          textToVerify: fullContentText,
          availableEvidence: evidencePack,
        },
      }),
      complianceAgent.execute({
        taskId: `${task.taskId}_comp`,
        tenantId: task.tenantId || 'tenant-default',
        brandId,
        input: {
          contentItemId,
          channel,
          text: fullContentText,
          prohibitedPhrases,
          requiredDisclaimers,
        },
      }),
      brandCriticAgent.execute({
        taskId: `${task.taskId}_brandcritic`,
        tenantId: task.tenantId || 'tenant-default',
        brandId,
        input: {
          contentItemId,
          headline: primaryVariant?.headline || contentItem.title,
          bodyText: primaryVariant?.bodyText || fullContentText,
          brandName: brandCtx.output?.brandName || 'Brand',
          personality: brandCtx.output?.personality || 'Professional',
          tone: brandCtx.output?.tone || 'Authoritative',
          preferredVocabulary: brandCtx.output?.preferredVocabulary || [],
          targetAudience: brandCtx.output?.targetAudience || 'B2B Buyers',
        },
      }),
      accessibilityAgent.execute({
        taskId: `${task.taskId}_access`,
        tenantId: task.tenantId || 'tenant-default',
        brandId,
        input: {
          contentItemId,
          format: contentItem.format as any,
          text: fullContentText,
          altText: primaryVariant?.altText || undefined,
          visualConcept: primaryVariant?.visualConcept || undefined,
        },
      }),
      seoDiscoveryAgent.execute({
        taskId: `${task.taskId}_seo`,
        tenantId: task.tenantId || 'tenant-default',
        brandId,
        input: {
          contentItemId,
          channel,
          title: contentItem.title,
          bodyText: fullContentText,
          industry: brandCtx.output?.industry || 'Technology',
          brandKeywords: brandCtx.output?.preferredVocabulary || [],
        },
      }),
    ]);

    // 4. Duplicate similarity check
    const existingItems = await db.contentItem.findMany({
      where: {
        campaign: { brandId },
        id: { not: contentItem.id },
      },
      select: { title: true, coreIdea: true },
    });

    let maxSimilarity = 0.0;
    for (const item of existingItems) {
      if (item.title.toLowerCase() === contentItem.title.toLowerCase()) {
        maxSimilarity = 1.0;
      } else if (fullContentText.toLowerCase().includes(item.coreIdea.toLowerCase().slice(0, 30))) {
        maxSimilarity = Math.max(maxSimilarity, 0.75);
      }
    }

    // Extract independent outputs
    const factOutput = factRes.output!;
    const compOutput = complianceRes.output!;
    const brandOutput = brandRes.output!;
    const accessOutput = accessRes.output!;
    const seoOutput = seoRes.output!;

    const blockingReasons: string[] = [];
    const revisionInstructions: string[] = [];
    let humanEscalationRequired = false;
    let humanEscalationReason: string | undefined = undefined;

    // Check hard deterministic blocks
    if (compOutput.deterministicHardBlock) {
      blockingReasons.push('Compliance Hard Block: Critical secret or security violation detected.');
    }
    if (factOutput.hasUnsupportedHighRiskClaim) {
      blockingReasons.push('Fact Verification Block: High-risk statistical claim lacks RAG evidence verification.');
    }

    // Check threshold violations
    if (brandOutput.brandDnaScore < thresholds.minBrandScore) {
      revisionInstructions.push(`Brand DNA score (${brandOutput.brandDnaScore}) is below minimum threshold (${thresholds.minBrandScore}). ${brandOutput.revisionAdvice}`);
    }
    if (factOutput.factualRiskScore > thresholds.maxFactualRisk) {
      revisionInstructions.push(`Factual risk score (${factOutput.factualRiskScore}) exceeds safe threshold (${thresholds.maxFactualRisk}). Verify or cite claims.`);
    }
    if (maxSimilarity > thresholds.maxDuplicateSimilarity) {
      revisionInstructions.push(`Duplicate content similarity (${(maxSimilarity * 100).toFixed(0)}%) exceeds allowed ceiling (${(thresholds.maxDuplicateSimilarity * 100).toFixed(0)}%).`);
    }
    if (thresholds.mandatoryAccessibility && accessOutput.status === 'needs_revision') {
      revisionInstructions.push(`Accessibility check failed: ${accessOutput.remediations.join('; ')}`);
    }

    // Determine Aggregated Council Decision
    let overallStatus: 'passed' | 'needs_revision' | 'blocked' = 'passed';
    if (blockingReasons.length > 0 || compOutput.status === 'block') {
      overallStatus = 'blocked';
    } else if (revisionInstructions.length > 0 || factOutput.status === 'needs_revision' || brandOutput.status === 'needs_revision') {
      overallStatus = 'needs_revision';
    }

    const warnings: string[] = [
      ...compOutput.violations.map((v) => v.message),
      ...brandOutput.deviations.map((d) => d.description),
      ...accessOutput.issues.map((i) => i.description),
    ];

    const corrections: string[] = [
      ...compOutput.violations.map((v) => v.recommendedCorrection),
      ...brandOutput.deviations.map((d) => d.suggestedRevision),
      ...accessOutput.remediations,
    ];

    const output: ReviewOutput = {
      brandScore: brandOutput.brandDnaScore,
      factualRiskScore: factOutput.factualRiskScore,
      complianceScore: compOutput.complianceScore,
      originalityScore: Math.round((1 - maxSimilarity) * 100),
      readabilityScore: accessOutput.accessibilityScore,
      overallStatus,
      warnings,
      corrections,
      evidence: evidencePack,
      prohibitedTermsFound: compOutput.prohibitedPhrasesFound,
      missingDisclaimers: compOutput.missingDisclaimersFound,
      duplicateSimilarity: maxSimilarity,
      qualityCouncilDetails: {
        factVerification: factOutput,
        compliance: compOutput,
        brandCritic: brandOutput,
        accessibility: accessOutput,
        seoDiscovery: seoOutput,
        blockingReasons,
        revisionInstructions,
        humanEscalationRequired,
        humanEscalationReason,
      },
    };

    // Save or update ReviewResult in Database
    await db.reviewResult.upsert({
      where: { contentItemId: contentItem.id },
      update: {
        brandScore: output.brandScore,
        factualRiskScore: output.factualRiskScore,
        complianceScore: output.complianceScore,
        originalityScore: output.originalityScore,
        readabilityScore: output.readabilityScore,
        overallStatus: output.overallStatus,
        confidence: 0.96,
        warningsJson: JSON.stringify(output.warnings),
        correctionsJson: JSON.stringify(output.corrections),
        evidenceRefsJson: JSON.stringify(output.evidence),
        prohibitedTermsFound: output.prohibitedTermsFound.join(','),
        missingDisclaimers: output.missingDisclaimers.join(','),
        duplicateSimilarity: output.duplicateSimilarity,
      },
      create: {
        contentItemId: contentItem.id,
        brandScore: output.brandScore,
        factualRiskScore: output.factualRiskScore,
        complianceScore: output.complianceScore,
        originalityScore: output.originalityScore,
        readabilityScore: output.readabilityScore,
        overallStatus: output.overallStatus,
        confidence: 0.96,
        warningsJson: JSON.stringify(output.warnings),
        correctionsJson: JSON.stringify(output.corrections),
        evidenceRefsJson: JSON.stringify(output.evidence),
        prohibitedTermsFound: output.prohibitedTermsFound.join(','),
        missingDisclaimers: output.missingDisclaimers.join(','),
        duplicateSimilarity: output.duplicateSimilarity,
      },
    });

    return {
      taskId: task.taskId,
      agentName: 'QualityCouncilCoordinator',
      status: overallStatus === 'passed' ? 'completed' : overallStatus === 'needs_revision' ? 'needs_revision' : 'blocked',
      output,
      confidence: 0.96,
      warnings,
      evidence: evidencePack,
      evaluationScores: {
        brandScore: output.brandScore,
        factualRiskScore: output.factualRiskScore,
        complianceScore: output.complianceScore,
        accessibilityScore: accessOutput.accessibilityScore,
        seoDiscoveryScore: seoOutput.discoveryScore,
      },
      usage: {
        latencyMs: Date.now() - startTime,
      },
      provenance: {
        model: 'quality-council-coordinator-v1',
        promptVersion: 'v1.0',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const reviewAgent = new ReviewAgent();

// Register in AgentRegistry
agentRegistry.register({
  name: 'ReviewAgent',
  version: '1.0.0',
  description: 'Quality Council Coordinator aggregating Fact Verification, Compliance, Brand Critic, Accessibility, and SEO agents',
  executionMode: 'hybrid',
  inputSchema: undefined as any,
  outputSchema: undefined as any,
  allowedTools: ['quality_council_evaluator'],
  enabled: true,
  handler: (task) => reviewAgent.execute(task),
});

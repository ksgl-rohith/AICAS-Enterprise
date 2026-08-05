import { db } from '@/lib/db';
import { AgentResult, AgentTask, EvidenceReference } from './agent-contract';
import { brandContextAgent } from './brand-context-agent';

export interface ReviewInput {
  contentItemId: string;
  brandId: string;
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
  evidence: EvidenceReference[];
  prohibitedTermsFound: string[];
  missingDisclaimers: string[];
  duplicateSimilarity: number;
}

export class ReviewAgent {
  public async execute(task: AgentTask<ReviewInput>): Promise<AgentResult<ReviewOutput>> {
    const startTime = Date.now();
    
    // Fetch content item & variants
    const contentItem = await db.contentItem.findUnique({
      where: { id: task.input.contentItemId },
      include: {
        variants: true,
      },
    });

    if (!contentItem) {
      return {
        taskId: task.taskId,
        status: 'failed',
        confidence: 0,
        warnings: ['Content item not found'],
        evidence: [],
      };
    }

    // Fetch brand context
    const brandCtx = await brandContextAgent.execute({
      taskId: `${task.taskId}_brand`,
      brandId: task.brandId,
      input: { brandId: task.brandId, query: contentItem.title },
    });

    const prohibitedPhrases = brandCtx.output?.prohibitedPhrases || [];
    const requiredDisclaimers = brandCtx.output?.requiredDisclaimers || [];
    const groundedChunks = brandCtx.output?.groundedChunks || [];

    // Combine all variant text
    const fullContentText = contentItem.variants
      .map((v) => `${v.hook} ${v.bodyText} ${v.ctaText}`)
      .join(' ');

    const textLower = fullContentText.toLowerCase();

    // 1. Check prohibited phrases
    const foundProhibited: string[] = [];
    for (const phrase of prohibitedPhrases) {
      if (phrase && textLower.includes(phrase.toLowerCase())) {
        foundProhibited.push(phrase);
      }
    }

    // 2. Check required disclaimers
    const missingDisclaimers: string[] = [];
    for (const disclaimer of requiredDisclaimers) {
      if (disclaimer && !textLower.includes(disclaimer.toLowerCase().slice(0, 20))) {
        missingDisclaimers.push(disclaimer);
      }
    }

    // 3. Duplicate similarity check (compare against existing published items)
    const existingItems = await db.contentItem.findMany({
      where: {
        campaign: { brandId: task.brandId },
        id: { not: contentItem.id },
      },
      select: { title: true, coreIdea: true },
    });

    let maxSimilarity = 0.0;
    for (const item of existingItems) {
      if (item.title.toLowerCase() === contentItem.title.toLowerCase()) {
        maxSimilarity = 1.0;
      } else if (textLower.includes(item.coreIdea.toLowerCase().slice(0, 30))) {
        maxSimilarity = Math.max(maxSimilarity, 0.75);
      }
    }

    // 4. Calculate Scores
    let brandScore = 95;
    let complianceScore = 98;
    let factualRiskScore = 10;
    const warnings: string[] = [];
    const corrections: string[] = [];

    if (foundProhibited.length > 0) {
      brandScore -= 30 * foundProhibited.length;
      complianceScore -= 40;
      warnings.push(`Prohibited phrase detected: ${foundProhibited.join(', ')}`);
      corrections.push(`Remove or rephrase prohibited terms: ${foundProhibited.join(', ')}`);
    }

    if (missingDisclaimers.length > 0) {
      complianceScore -= 20 * missingDisclaimers.length;
      warnings.push(`Missing mandatory disclaimers: ${missingDisclaimers.join(', ')}`);
      corrections.push(`Append required disclaimer text: "${missingDisclaimers[0]}"`);
    }

    if (maxSimilarity > 0.8) {
      warnings.push(`High content similarity (${(maxSimilarity * 100).toFixed(0)}%) with prior post.`);
    }

    if (groundedChunks.length === 0) {
      factualRiskScore += 25;
      warnings.push('No grounding whitepaper documents found. Claim accuracy risk elevated.');
    }

    brandScore = Math.max(0, Math.min(100, brandScore));
    complianceScore = Math.max(0, Math.min(100, complianceScore));
    factualRiskScore = Math.max(0, Math.min(100, factualRiskScore));

    // Determine Overall Status
    let overallStatus: 'passed' | 'needs_revision' | 'blocked' = 'passed';
    if (foundProhibited.length > 0 || complianceScore < 60) {
      overallStatus = 'blocked';
    } else if (brandScore < 80 || missingDisclaimers.length > 0 || maxSimilarity > 0.8) {
      overallStatus = 'needs_revision';
    }

    const output: ReviewOutput = {
      brandScore,
      factualRiskScore,
      complianceScore,
      originalityScore: Math.round((1 - maxSimilarity) * 100),
      readabilityScore: 90,
      overallStatus,
      warnings,
      corrections,
      evidence: brandCtx.evidence,
      prohibitedTermsFound: foundProhibited,
      missingDisclaimers,
      duplicateSimilarity: maxSimilarity,
    };

    // Save or update ReviewResult in DB
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
      status: overallStatus === 'passed' ? 'completed' : overallStatus === 'needs_revision' ? 'needs_revision' : 'blocked',
      output,
      confidence: 0.96,
      warnings,
      evidence: brandCtx.evidence,
      usage: {
        latencyMs: Date.now() - startTime,
      },
      provenance: {
        model: 'review-agent-v1',
        promptVersion: 'v1.0-review',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const reviewAgent = new ReviewAgent();

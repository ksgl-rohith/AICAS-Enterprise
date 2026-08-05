import { z } from 'zod';
import { AgentResult, AgentTask } from './agent-contract';
import { agentRegistry } from './agent-registry';
import { EvidenceRecord, EvidenceRecordSchema } from './evidence-model';

export const ClaimClassificationSchema = z.enum([
  'supported',
  'partially_supported',
  'unsupported',
  'contradictory',
  'unverifiable',
]);

export type ClaimClassification = z.infer<typeof ClaimClassificationSchema>;

export const VerifiedClaimSchema = z.object({
  claimId: z.string(),
  extractedText: z.string(),
  claimType: z.enum(['statistic', 'performance_claim', 'feature_fact', 'historical_fact', 'opinion_or_marketing']),
  classification: ClaimClassificationSchema,
  confidence: z.number().min(0).max(1),
  matchedEvidence: z.array(EvidenceRecordSchema).default([]),
  correctedWording: z.string().optional(),
  isHighRisk: z.boolean(),
});

export type VerifiedClaim = z.infer<typeof VerifiedClaimSchema>;

export const FactVerificationInputSchema = z.object({
  contentItemId: z.string(),
  textToVerify: z.string(),
  availableEvidence: z.array(EvidenceRecordSchema).default([]),
  strictness: z.enum(['standard', 'strict', 'regulatory']).optional().default('standard'),
});

export type FactVerificationInput = z.input<typeof FactVerificationInputSchema>;

export const FactVerificationOutputSchema = z.object({
  contentItemId: z.string(),
  claims: z.array(VerifiedClaimSchema),
  overallFactualConfidence: z.number().min(0).max(1),
  factualRiskScore: z.number().min(0).max(100),
  hasUnsupportedHighRiskClaim: z.boolean(),
  status: z.enum(['passed', 'needs_revision', 'blocked']),
});

export type FactVerificationOutput = z.infer<typeof FactVerificationOutputSchema>;

export function extractAndVerifyClaims(
  text: string,
  evidence: EvidenceRecord[]
): VerifiedClaim[] {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  const verifiedClaims: VerifiedClaim[] = [];

  sentences.forEach((sentence, idx) => {
    const hasNumberOrPercent = /\d+(?:\.\d+)?%|\$\d+|\d+\s*(?:x|users|customers|percent|billion|million)/i.test(sentence);
    const hasFeatureKeyword = /features|includes|supports|provides|guarantees|increases|reduces/i.test(sentence);
    const isOpinion = /we believe|in our view|our mission|excited to|hope to|strive/i.test(sentence);

    if (isOpinion) {
      verifiedClaims.push({
        claimId: `claim_${idx + 1}`,
        extractedText: sentence,
        claimType: 'opinion_or_marketing',
        classification: 'supported',
        confidence: 1.0,
        matchedEvidence: [],
        isHighRisk: false,
      });
      return;
    }

    const claimType = hasNumberOrPercent ? 'statistic' : hasFeatureKeyword ? 'feature_fact' : 'historical_fact';
    const isHighRisk = claimType === 'statistic' || sentence.includes('guarantee');

    // Match against evidence
    const matchingEvidence = evidence.filter((ev) => {
      const excerptLower = ev.retrievedExcerpt.toLowerCase();
      const sentenceWords = sentence.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
      const matchCount = sentenceWords.filter((w) => excerptLower.includes(w)).length;
      return matchCount >= 2;
    });

    let classification: ClaimClassification = 'unverified' as any;
    let confidence = 0.5;
    let correctedWording: string | undefined = undefined;

    if (matchingEvidence.length > 0) {
      const topEv = matchingEvidence[0];
      classification = topEv.confidence > 0.8 ? 'supported' : 'partially_supported';
      confidence = topEv.confidence;
    } else if (hasNumberOrPercent) {
      // Numerical claim with zero evidence
      classification = 'unsupported';
      confidence = 0.2;
      correctedWording = sentence.replace(/\d+(?:\.\d+)?%|\$\d+/g, '[verified metric]');
    } else {
      classification = 'unverifiable';
      confidence = 0.6;
    }

    verifiedClaims.push({
      claimId: `claim_${idx + 1}`,
      extractedText: sentence,
      claimType,
      classification,
      confidence,
      matchedEvidence: matchingEvidence,
      correctedWording,
      isHighRisk,
    });
  });

  return verifiedClaims;
}

export class FactVerificationAgent {
  public async execute(
    task: AgentTask<FactVerificationInput>
  ): Promise<AgentResult<FactVerificationOutput>> {
    const startTime = Date.now();
    const { contentItemId, textToVerify, availableEvidence } = task.input;

    const evidenceList = availableEvidence || [];
    const claims = extractAndVerifyClaims(textToVerify, evidenceList);

    const highRiskUnsupported = claims.some(
      (c) => c.isHighRisk && (c.classification === 'unsupported' || c.classification === 'contradictory')
    );

    const supportedCount = claims.filter((c) => c.classification === 'supported').length;
    const overallFactualConfidence = claims.length > 0
      ? Math.round((supportedCount / claims.length) * 100) / 100
      : 1.0;

    const factualRiskScore = highRiskUnsupported
      ? 85
      : Math.round((1 - overallFactualConfidence) * 100);

    const status: 'passed' | 'needs_revision' | 'blocked' = highRiskUnsupported ? 'blocked' : factualRiskScore > 30 ? 'needs_revision' : 'passed';

    const output: FactVerificationOutput = {
      contentItemId,
      claims,
      overallFactualConfidence,
      factualRiskScore,
      hasUnsupportedHighRiskClaim: highRiskUnsupported,
      status,
    };

    return {
      taskId: task.taskId,
      agentName: 'FactVerificationAgent',
      status: status === 'passed' ? 'completed' : status === 'blocked' ? 'blocked' : 'needs_revision',
      output,
      confidence: overallFactualConfidence,
      warnings: highRiskUnsupported ? ['High-risk unsupported statistical claim detected! Content blocked until verified.'] : [],
      evidence: claims.flatMap((c) => c.matchedEvidence),
      evaluationScores: {
        totalClaims: claims.length,
        overallFactualConfidence,
        factualRiskScore,
      },
      usage: {
        latencyMs: Date.now() - startTime,
      },
      provenance: {
        model: 'fact-verification-engine-v1',
        promptVersion: 'v1.0',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const factVerificationAgent = new FactVerificationAgent();

// Register agent in AgentRegistry
agentRegistry.register({
  name: 'FactVerificationAgent',
  version: '1.0.0',
  description: 'Extracts claims and verifies them against RAG evidence, blocking unsupported high-risk claims',
  executionMode: 'hybrid',
  inputSchema: FactVerificationInputSchema,
  outputSchema: FactVerificationOutputSchema,
  allowedTools: ['rag_verifier', 'claim_extractor'],
  enabled: true,
  handler: (task) => factVerificationAgent.execute(task),
});

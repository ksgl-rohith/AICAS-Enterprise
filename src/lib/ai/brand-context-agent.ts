import { db } from '@/lib/db';
import { AgentResult, AgentTask, EvidenceReference } from './agent-contract';
import { brandContextPackageBuilder, BrandContextPackage } from './brand-context-package';
import { brandContextReadinessGate, BrandContextReadinessResult } from './brand-context-readiness-gate';

export interface BrandContextInput {
  brandId: string;
  query?: string;
}

export interface BrandContextOutput {
  package: BrandContextPackage;
  readiness: BrandContextReadinessResult;
  brandName: string;
  industry: string;
  description: string;
  targetAudience: string;
  personality: string;
  tone: string;
  preferredVocabulary: string[];
  prohibitedPhrases: string[];
  requiredDisclaimers: string[];
  defaultCTA: string;
  groundedChunks: {
    chunkId: string;
    filename: string;
    content: string;
    score: number;
  }[];
}

export class BrandContextAgent {
  public async execute(task: AgentTask<BrandContextInput>): Promise<AgentResult<BrandContextOutput>> {
    const startTime = Date.now();
    const pkg = await brandContextPackageBuilder.buildPackage(task.input.brandId, task.input.query, task.tenantId || 'tenant-default');

    if (!pkg) {
      const readiness = brandContextReadinessGate.evaluateReadiness(null);
      return {
        taskId: task.taskId,
        status: 'failed',
        confidence: 0,
        warnings: ['Brand not found in database.'],
        evidence: [],
      };
    }

    const readiness = brandContextReadinessGate.evaluateReadiness(pkg);

    const evidence: EvidenceReference[] = pkg.groundedChunks.map((c) => ({
      chunkId: c.chunkId,
      filename: c.filename,
      sourceText: c.content.slice(0, 100) + '...',
      confidence: c.score,
    }));

    const output: BrandContextOutput = {
      package: pkg,
      readiness,
      brandName: pkg.brandName,
      industry: pkg.industry,
      description: pkg.description,
      targetAudience: pkg.targetAudience,
      personality: pkg.personality,
      tone: pkg.tone,
      preferredVocabulary: pkg.preferredVocabulary,
      prohibitedPhrases: pkg.prohibitedPhrases,
      requiredDisclaimers: pkg.requiredDisclaimers,
      defaultCTA: pkg.defaultCTA,
      groundedChunks: pkg.groundedChunks,
    };

    const warnings: string[] = [...readiness.warnings];
    if (!readiness.sufficientForGeneration) {
      warnings.unshift(`Brand context readiness is low (${Math.round(readiness.readinessScore * 100)}%).`);
    }

    return {
      taskId: task.taskId,
      status: readiness.sufficientForGeneration ? 'completed' : 'needs_revision',
      output,
      confidence: readiness.readinessScore,
      warnings,
      evidence,
      usage: {
        latencyMs: Date.now() - startTime,
      },
      provenance: {
        model: 'brand-context-package-builder-v2',
        promptVersion: 'v2.0',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const brandContextAgent = new BrandContextAgent();

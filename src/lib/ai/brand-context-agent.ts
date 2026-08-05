import { db } from '@/lib/db';
import { AgentResult, AgentTask, EvidenceReference } from './agent-contract';

export interface BrandContextInput {
  brandId: string;
  query?: string;
}

export interface BrandContextOutput {
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
    const brand = await db.brand.findUnique({
      where: { id: task.brandId },
      include: {
        knowledgeDocs: true,
        knowledgeChunks: true,
      },
    });

    if (!brand) {
      return {
        taskId: task.taskId,
        status: 'failed',
        confidence: 0,
        warnings: ['Brand not found'],
        evidence: [],
      };
    }

    const query = task.input.query?.toLowerCase() || '';
    
    // Rank & retrieve relevant knowledge chunks
    const rankedChunks = brand.knowledgeChunks
      .map((chunk) => {
        let score = 0.5;
        if (query) {
          const contentLower = chunk.content.toLowerCase();
          const queryWords = query.split(' ').filter((w) => w.length > 3);
          const matches = queryWords.filter((word) => contentLower.includes(word));
          score = matches.length > 0 ? 0.6 + (matches.length / queryWords.length) * 0.35 : 0.2;
        }
        const doc = brand.knowledgeDocs.find((d) => d.id === chunk.documentId);
        return {
          chunkId: chunk.id,
          filename: doc?.filename || 'Document',
          content: chunk.content,
          score: Math.min(1.0, score),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const evidence: EvidenceReference[] = rankedChunks.map((c) => ({
      chunkId: c.chunkId,
      filename: c.filename,
      sourceText: c.content.slice(0, 100) + '...',
      confidence: c.score,
    }));

    const output: BrandContextOutput = {
      brandName: brand.name,
      industry: brand.industry,
      description: brand.description,
      targetAudience: brand.targetAudience,
      personality: brand.personality,
      tone: brand.tone,
      preferredVocabulary: brand.preferredVocabulary.split(',').map((s) => s.trim()).filter(Boolean),
      prohibitedPhrases: brand.prohibitedPhrases.split(',').map((s) => s.trim()).filter(Boolean),
      requiredDisclaimers: brand.requiredDisclaimers.split(',').map((s) => s.trim()).filter(Boolean),
      defaultCTA: brand.defaultCTA,
      groundedChunks: rankedChunks,
    };

    return {
      taskId: task.taskId,
      status: 'completed',
      output,
      confidence: 0.98,
      warnings: rankedChunks.length === 0 ? ['No grounded knowledge documents found for brand.'] : [],
      evidence,
      usage: {
        latencyMs: Date.now() - startTime,
      },
      provenance: {
        model: 'brand-context-retriever-v1',
        promptVersion: 'v1.0',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const brandContextAgent = new BrandContextAgent();

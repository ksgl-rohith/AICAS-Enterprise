import { z } from 'zod';
import { AgentResult, AgentTask } from './agent-contract';
import { agentRegistry } from './agent-registry';

export const SeoDiscoveryInputSchema = z.object({
  contentItemId: z.string(),
  channel: z.enum(['linkedin', 'facebook', 'instagram', 'telegram']),
  title: z.string(),
  bodyText: z.string(),
  industry: z.string(),
  brandKeywords: z.array(z.string()).default([]),
});

export type SeoDiscoveryInput = z.input<typeof SeoDiscoveryInputSchema>;

export const SeoDiscoveryOutputSchema = z.object({
  contentItemId: z.string(),
  optimizedTitle: z.string(),
  searchKeywords: z.array(z.string()),
  hashtags: z.array(z.string()),
  metaDescription: z.string(),
  discoveryScore: z.number().min(0).max(100),
  recommendations: z.array(z.string()),
});

export type SeoDiscoveryOutput = z.infer<typeof SeoDiscoveryOutputSchema>;

export class SeoDiscoveryAgent {
  public async execute(
    task: AgentTask<SeoDiscoveryInput>
  ): Promise<AgentResult<SeoDiscoveryOutput>> {
    const startTime = Date.now();
    const { contentItemId, channel, title, bodyText, industry, brandKeywords } = task.input;

    // 1. Extract keywords (distinguishing search keywords from hashtags)
    const rawWords = (title + ' ' + bodyText + ' ' + industry)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !['this', 'that', 'with', 'from', 'have', 'your', 'about'].includes(w));

    const wordCounts: Record<string, number> = {};
    rawWords.forEach((w) => (wordCounts[w] = (wordCounts[w] || 0) + 1));

    const topKeywords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([w]) => w);

    const searchKeywords = Array.from(new Set([...(brandKeywords || []).slice(0, 3), ...topKeywords]));

    // 2. Generate channel-appropriate hashtags
    const maxHashtags: Record<string, number> = {
      linkedin: 4,
      facebook: 3,
      instagram: 15,
      telegram: 5,
    };

    const hashtagLimit = maxHashtags[channel] || 5;
    const hashtags = searchKeywords
      .slice(0, hashtagLimit)
      .map((kw) => `#${kw.replace(/\s+/g, '')}`);

    // 3. Meta description generation
    const cleanText = bodyText.replace(/[\n\r]+/g, ' ').trim();
    const metaDescription = cleanText.length > 155 ? `${cleanText.slice(0, 152)}...` : cleanText;

    // 4. Discovery Recommendations
    const recommendations: string[] = [
      `Include primary keyword "${searchKeywords[0] || industry}" in first 2 lines for platform search indexing.`,
      `Optimal hashtag density applied (${hashtags.length} hashtags for ${channel}).`,
    ];

    const discoveryScore = Math.min(100, 70 + hashtags.length * 5 + ((brandKeywords?.length || 0) > 0 ? 10 : 0));

    const output: SeoDiscoveryOutput = {
      contentItemId,
      optimizedTitle: title,
      searchKeywords,
      hashtags,
      metaDescription,
      discoveryScore,
      recommendations,
    };

    return {
      taskId: task.taskId,
      agentName: 'SeoDiscoveryAgent',
      status: 'completed',
      output,
      confidence: 0.9,
      warnings: [],
      evidence: [],
      evaluationScores: {
        discoveryScore,
        keywordCount: searchKeywords.length,
        hashtagCount: hashtags.length,
      },
      usage: {
        latencyMs: Date.now() - startTime,
      },
      provenance: {
        model: 'seo-discovery-engine-v1',
        promptVersion: 'v1.0',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const seoDiscoveryAgent = new SeoDiscoveryAgent();

// Register agent in AgentRegistry
agentRegistry.register({
  name: 'SeoDiscoveryAgent',
  version: '1.0.0',
  description: 'Optimizes titles, keywords, hashtags, and metadata per social platform limits',
  executionMode: 'deterministic',
  inputSchema: SeoDiscoveryInputSchema,
  outputSchema: SeoDiscoveryOutputSchema,
  allowedTools: ['seo_keyword_extractor', 'hashtag_optimizer'],
  enabled: true,
  handler: (task) => seoDiscoveryAgent.execute(task),
});

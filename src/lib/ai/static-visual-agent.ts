import { AgentResult, AgentTask } from './agent-contract';
import { modelGateway } from './model-gateway';
import { z } from 'zod';

export interface StaticVisualInput {
  topicTitle: string;
  brandName: string;
  industry: string;
  quoteOrStat?: string;
  authorOrSource?: string;
}

export const StaticVisualOutputSchema = z.object({
  visualType: z.enum(['quote_card', 'stat_callout', 'announcement_banner', 'tip_card']),
  headline: z.string(),
  primaryText: z.string(),
  authorOrSource: z.string(),
  badgeText: z.string(),
  accentColor: z.string(),
  backgroundTheme: z.string(),
  layoutFormat: z.string(),
});

export type StaticVisualOutput = z.infer<typeof StaticVisualOutputSchema>;

export class StaticVisualAgent {
  public async execute(task: AgentTask<StaticVisualInput>): Promise<AgentResult<StaticVisualOutput>> {
    const startTime = Date.now();
    const { topicTitle, brandName, industry, quoteOrStat, authorOrSource } = task.input;

    const systemPrompt = `You are a Static Brand Graphic & Quote Card AI Agent.
Create a visually striking static social graphic (quote card, key stat callout, or announcement banner) for "${brandName}" in ${industry}.`;

    const userPrompt = `Topic: ${topicTitle}
Quote/Stat: ${quoteOrStat || 'N/A'}`;

    const mockFallback: StaticVisualOutput = {
      visualType: quoteOrStat ? 'quote_card' : 'stat_callout',
      headline: topicTitle,
      primaryText: quoteOrStat || `“Excellence, transparency, and client trust define ${brandName}'s approach to ${topicTitle} in ${industry}.”`,
      authorOrSource: authorOrSource || `${brandName} Leadership`,
      badgeText: `${industry} Insights`,
      accentColor: '#6366f1',
      backgroundTheme: 'dark_slate_gradient',
      layoutFormat: 'Minimalist Typography Card with Metallic Accent Borders',
    };

    const res = await modelGateway.generateStructured({
      systemPrompt,
      userPrompt,
      schema: StaticVisualOutputSchema,
      mockFallback,
    });

    return {
      taskId: task.taskId,
      status: 'completed',
      output: res.output,
      confidence: 0.98,
      warnings: [],
      evidence: [],
      usage: {
        latencyMs: Date.now() - startTime,
        estimatedTokens: res.tokensUsed,
      },
      provenance: {
        model: res.modelUsed,
        promptVersion: 'v2.0-dynamic-static-visual',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const staticVisualAgent = new StaticVisualAgent();

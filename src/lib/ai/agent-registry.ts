import { z } from 'zod';
import { AgentResult, AgentTask, AgentError } from './agent-contract';
import { analyticsAgent, AnalyticsReportSchema } from './analytics-agent';
import { experimentAgent, ExperimentDesignSchema } from './experiment-agent';
import { optimizationAgent, RecommendationSchema } from './optimization-agent';
import { costGovernanceAgent, CostDecisionSchema } from './cost-governance-agent';
import { communityAgent, CommunityResponseSchema } from './community-agent';
import { localizationAgent, LocalizationSchema } from './localization-agent';
import { videoAgent, VideoPackageSchema } from './video-agent';

export type AgentExecutionMode = 'deterministic' | 'model-driven' | 'retrieval-driven' | 'hybrid';

export interface RegisteredAgentMetaData<Input = any, Output = any> {
  name: string;
  version: string;
  description: string;
  executionMode: AgentExecutionMode;
  inputSchema: z.ZodType<Input>;
  outputSchema: z.ZodType<Output>;
  allowedTools: string[];
  enabled: boolean;
  handler: (task: AgentTask<any>) => Promise<AgentResult<any>>;
}

export class AgentRegistry {
  private static instance: AgentRegistry;
  private agents: Map<string, RegisteredAgentMetaData> = new Map();

  private constructor() {
    this.registerPhase3Agents();
  }

  public static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  private registerPhase3Agents() {
    this.register({
      name: 'AnalyticsAgent',
      version: 'v1.0',
      description: 'Explains content performance against baselines and identifies bottlenecks.',
      executionMode: 'hybrid',
      inputSchema: z.object({ brandId: z.string(), campaignId: z.string().optional() }),
      outputSchema: AnalyticsReportSchema,
      allowedTools: ['analyticsIngestionService'],
      enabled: true,
      handler: (t) => analyticsAgent.execute(t),
    });

    this.register({
      name: 'ExperimentAgent',
      version: 'v1.0',
      description: 'Designs and evaluates controlled growth experiments.',
      executionMode: 'hybrid',
      inputSchema: z.object({ brandId: z.string(), hypothesis: z.string(), primaryMetric: z.string() }),
      outputSchema: ExperimentDesignSchema,
      allowedTools: ['statisticalEvaluator'],
      enabled: true,
      handler: (t) => experimentAgent.execute(t),
    });

    this.register({
      name: 'OptimizationAgent',
      version: 'v2.0',
      description: 'Proposes next-post recommendations and manages recommendation lifecycles.',
      executionMode: 'hybrid',
      inputSchema: z.object({ brandId: z.string(), campaignId: z.string().optional() }),
      outputSchema: RecommendationSchema,
      allowedTools: ['learningMemoryService'],
      enabled: true,
      handler: (t) => optimizationAgent.execute(t),
    });

    this.register({
      name: 'CostGovernanceAgent',
      version: 'v1.0',
      description: 'Enforces budget limits, model tier routing, and cost governance.',
      executionMode: 'deterministic',
      inputSchema: z.object({ taskComplexity: z.enum(['LOW', 'MEDIUM', 'HIGH']), riskCategory: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']) }),
      outputSchema: CostDecisionSchema,
      allowedTools: ['modelGateway'],
      enabled: true,
      handler: (t) => costGovernanceAgent.execute(t),
    });

    this.register({
      name: 'CommunityAgent',
      version: 'v1.0',
      description: 'Classifies community interactions, drafts responses, and escalates sensitive issues.',
      executionMode: 'hybrid',
      inputSchema: z.object({ brandId: z.string(), platform: z.string(), externalMessageId: z.string(), senderHandle: z.string(), content: z.string() }),
      outputSchema: CommunityResponseSchema,
      allowedTools: ['modelGateway'],
      enabled: true,
      handler: (t) => communityAgent.execute(t),
    });

    this.register({
      name: 'LocalizationAgent',
      version: 'v1.0',
      description: 'Adapts approved source content into target locales with transcreation and lineage.',
      executionMode: 'hybrid',
      inputSchema: z.object({ sourceContentId: z.string(), sourceLocale: z.string(), targetLocale: z.string(), bodyText: z.string(), ctaText: z.string(), brandPersonality: z.string() }),
      outputSchema: LocalizationSchema,
      allowedTools: ['modelGateway'],
      enabled: true,
      handler: (t) => localizationAgent.execute(t),
    });

    this.register({
      name: 'VideoAgent',
      version: 'v1.0',
      description: 'Generates structured short-form video packages and rendering previews.',
      executionMode: 'hybrid',
      inputSchema: z.object({ contentItemId: z.string(), topic: z.string(), targetAudience: z.string(), ctaText: z.string() }),
      outputSchema: VideoPackageSchema,
      allowedTools: ['videoRenderingProvider'],
      enabled: true,
      handler: (t) => videoAgent.execute(t),
    });
  }

  public register<Input, Output>(agent: RegisteredAgentMetaData<Input, Output>): void {
    const key = `${agent.name}:${agent.version}`;
    this.agents.set(key, agent as RegisteredAgentMetaData);
    this.agents.set(agent.name, agent as RegisteredAgentMetaData); // fallback to latest name
  }

  public getAgent(nameOrKey: string): RegisteredAgentMetaData | undefined {
    return this.agents.get(nameOrKey);
  }

  public listAgents(): Omit<RegisteredAgentMetaData, 'handler'>[] {
    const seen = new Set<string>();
    const list: Omit<RegisteredAgentMetaData, 'handler'>[] = [];

    for (const [key, agent] of this.agents.entries()) {
      if (!seen.has(agent.name)) {
        seen.add(agent.name);
        const { handler, ...meta } = agent;
        list.push(meta);
      }
    }
    return list;
  }

  public async executeAgent<Input, Output>(
    agentName: string,
    task: AgentTask<Input>
  ): Promise<AgentResult<Output>> {
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new AgentError({
        code: 'AGENT_NOT_FOUND',
        message: `Agent '${agentName}' is not registered in the Agent Registry.`,
        agentName,
        taskId: task.taskId,
        isRetryable: false,
        tenantId: task.tenantId,
        brandId: task.brandId,
      });
    }

    if (!agent.enabled) {
      throw new AgentError({
        code: 'AGENT_DISABLED',
        message: `Agent '${agentName}' is currently disabled via feature flag.`,
        agentName,
        taskId: task.taskId,
        isRetryable: false,
        tenantId: task.tenantId,
        brandId: task.brandId,
      });
    }

    const parsedInput = agent.inputSchema.safeParse(task.input);
    if (!parsedInput.success) {
      throw new AgentError({
        code: 'INVALID_INPUT_SCHEMA',
        message: `Input schema validation failed for agent '${agentName}': ${parsedInput.error.message}`,
        agentName,
        taskId: task.taskId,
        isRetryable: false,
        tenantId: task.tenantId,
        brandId: task.brandId,
        details: parsedInput.error.format(),
      });
    }

    let attempts = 0;
    const maxAttempts = 3;
    let lastError: any = null;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const result = await agent.handler(task);

        if (result.output && (result.status === 'completed' || result.status === 'needs_revision')) {
          const parsedOutput = agent.outputSchema.safeParse(result.output);
          if (!parsedOutput.success) {
            console.warn(`[AgentRegistry] Attempt ${attempts} output validation failed for ${agentName}:`, parsedOutput.error.message);
            if (attempts < maxAttempts) {
              continue;
            }
            throw new AgentError({
              code: 'INVALID_OUTPUT_SCHEMA',
              message: `Agent '${agentName}' returned malformed output after ${maxAttempts} attempts: ${parsedOutput.error.message}`,
              agentName,
              taskId: task.taskId,
              isRetryable: false,
              tenantId: task.tenantId,
              brandId: task.brandId,
              details: parsedOutput.error.format(),
            });
          }
        }

        return result as AgentResult<Output>;
      } catch (err: any) {
        lastError = err;
        if (err instanceof AgentError && !err.isRetryable) {
          throw err;
        }
      }
    }

    throw lastError || new Error(`Agent '${agentName}' execution failed after retries.`);
  }
}

export const agentRegistry = AgentRegistry.getInstance();

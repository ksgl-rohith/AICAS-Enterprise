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
export type AgentCategory = 'INTELLIGENCE' | 'STRATEGY_CREATION' | 'TRUST_GOVERNANCE' | 'EXECUTION_LEARNING';
export type CapabilityStatus = 'AVAILABLE' | 'BETA' | 'LIMITED' | 'DISABLED';

export interface RegisteredAgentMetaData<Input = any, Output = any> {
  name: string;
  version: string;
  description: string;
  executionMode: AgentExecutionMode;
  category?: AgentCategory;
  status?: CapabilityStatus;
  tag?: string;
  responsibilities?: string;
  inputs?: string;
  outputs?: string;
  exampleResult?: string;
  inputSchema?: z.ZodType<Input>;
  outputSchema?: z.ZodType<Output>;
  allowedTools?: string[];
  enabled: boolean;
  handler?: (task: AgentTask<any>) => Promise<AgentResult<any>>;
}

export class AgentRegistry {
  private static instance: AgentRegistry;
  private agents: Map<string, RegisteredAgentMetaData> = new Map();

  private constructor() {
    this.registerAllAgents();
  }

  public static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  private registerAllAgents() {
    // 1. INTELLIGENCE AGENTS
    this.register({
      name: 'BrandContextAgent',
      version: 'v1.0',
      description: 'Maintains brand memory, tone parameters, preferred/prohibited vocabulary, and RAG chunk retrieval.',
      executionMode: 'retrieval-driven',
      category: 'INTELLIGENCE',
      status: 'AVAILABLE',
      tag: 'Brand DNA Memory',
      responsibilities: 'Maintains brand memory, tone rules, preferred/prohibited vocabulary, and executes RAG vector chunk retrieval.',
      inputs: 'Brand profiles, PDF/Markdown whitepapers, competitor positioning, tone parameters.',
      outputs: 'Grounded context object, active tone guardrails, retrieved document evidence citations.',
      exampleResult: 'Retrieved Chunk #14 from whitepaper: "Enterprise AI reduces content velocity lag by 80%." Enforced tone: Authoritative & Technical.',
      allowedTools: ['vectorRetriever'],
      enabled: true,
    });

    this.register({
      name: 'WebsiteBrandIntelligenceAgent',
      version: 'v1.0',
      description: 'Autonomous SSRF-protected web scraper & multi-page brand DNA extractor.',
      executionMode: 'hybrid',
      category: 'INTELLIGENCE',
      status: 'AVAILABLE',
      tag: 'Website Extraction',
      responsibilities: 'Extracts company identity, offerings, target personas, and prohibited phrases directly from public website evidence with SSRF protection.',
      inputs: 'Website URL, target depth limits.',
      outputs: 'Structured brand profile, extracted products, tone analysis, canonical domain normalization.',
      exampleResult: 'Extracted brand DNA from https://apexai.solutions: 4 core products, B2B enterprise audience, 12 prohibited phrases.',
      allowedTools: ['ssrfSafeHttpClient', 'htmlTextExtractor'],
      enabled: true,
    });

    this.register({
      name: 'IngestionAgent',
      version: 'v1.0',
      description: 'Parses enterprise PDFs, Markdown files, and URLs into vector embeddings.',
      executionMode: 'deterministic',
      category: 'INTELLIGENCE',
      status: 'AVAILABLE',
      tag: 'Document Ingestion',
      responsibilities: 'Parses enterprise PDFs, Markdown files, and URLs into structured text chunks and vector embeddings.',
      inputs: 'Raw documents (PDF, TXT, MD), brand ID.',
      outputs: 'Vector chunks with cosine similarity metadata and character offsets.',
      exampleResult: 'Indexed document "Enterprise_AI_Whitepaper_2026.pdf" into 42 vector chunks.',
      allowedTools: ['pdfParser', 'textChunker'],
      enabled: true,
    });

    this.register({
      name: 'MarketResearchAgent',
      version: 'v1.0',
      description: 'Analyzes target audience demographics, pain points, and competitor positioning.',
      executionMode: 'hybrid',
      category: 'INTELLIGENCE',
      status: 'AVAILABLE',
      tag: 'Persona Positioning',
      responsibilities: 'Analyzes target audience demographics, pain points, decision drivers, and competitor gap positioning.',
      inputs: 'Industry vertical, target personas, product capabilities.',
      outputs: 'Audience summary, positioning map, and competitor counter-arguments.',
      exampleResult: 'Mapped 3 CTO pain points: compliance risk, brand voice drift, and manual review bottlenecks.',
      allowedTools: ['marketSignalService'],
      enabled: true,
    });

    this.register({
      name: 'TrendIntelligenceAgent',
      version: 'v1.0',
      description: 'Processes GDELT signals and topical relevance to identify strategic content angles.',
      executionMode: 'hybrid',
      category: 'INTELLIGENCE',
      status: 'AVAILABLE',
      tag: 'Signal Mining',
      responsibilities: 'Processes macro industry trends, GDELT signals, and topical relevance to identify high-opportunity content angles.',
      inputs: 'GDELT news feeds, industry topic keywords, target market verticals.',
      outputs: 'TrendSignal objects with opportunity score, freshness score, and strategic summary.',
      exampleResult: 'Detected Signal: "Agentic AI Infrastructure in Enterprise IT". Opportunity Score: 0.92, Freshness Score: 0.98.',
      allowedTools: ['gdeltSignalService'],
      enabled: true,
    });

    this.register({
      name: 'ForecastingAgent',
      version: 'v1.0',
      description: 'Predicts channel reach, impressions, and engagement with data sufficiency & confidence ratings.',
      executionMode: 'deterministic',
      category: 'INTELLIGENCE',
      status: 'AVAILABLE',
      tag: 'Performance Forecasting',
      responsibilities: 'Calculates predicted reach, bounds, expected lift, data sufficiency, and key performance impact factors.',
      inputs: 'Brand ID, channel, format, CTA, copy length, historical metric events.',
      outputs: 'PostForecastOutput with predicted reach, lower/upper bounds, confidence rating, and key impact factors.',
      exampleResult: 'Predicted reach for LinkedIn carousel: 3,000 impressions (+25% lift, High confidence). Data sufficiency: Sufficient.',
      allowedTools: ['historicalMetricsStore'],
      enabled: true,
    });

    // 2. STRATEGY & CREATION AGENTS
    this.register({
      name: 'StrategyAgent',
      version: 'v1.0',
      description: 'Translates campaign goals into actionable content pillars and channel roles.',
      executionMode: 'model-driven',
      category: 'STRATEGY_CREATION',
      status: 'AVAILABLE',
      tag: 'Pillar Mapping',
      responsibilities: 'Translates high-level campaign objectives into actionable content pillar breakdowns and channel role assignments.',
      inputs: 'Campaign wizard goals, audience personas, trend signals, brand guardrails.',
      outputs: 'CampaignStrategy narrative, content pillars, channel roles, constraint mappings.',
      exampleResult: 'Generated Strategy: 3 Pillars (Agentic Architecture, Security/Compliance, ROI Case Studies) assigned across LinkedIn & Instagram.',
      allowedTools: ['modelGateway'],
      enabled: true,
    });

    this.register({
      name: 'ContentPlanningAgent',
      version: 'v1.0',
      description: 'Determines optimal format distribution (text, image, carousel, video) and posting cadence.',
      executionMode: 'hybrid',
      category: 'STRATEGY_CREATION',
      status: 'AVAILABLE',
      tag: 'Format Matrix',
      responsibilities: 'Determines the optimal format distribution and posting cadence per social channel.',
      inputs: 'Campaign strategy pillars, historical channel engagement weights, target date windows.',
      outputs: 'ContentItem draft entities mapped to specific formats and target delivery dates.',
      exampleResult: 'Planned 6 items: 3 LinkedIn text posts, 2 Instagram visual briefs, 1 short-form video script.',
      allowedTools: ['channelMixEngine'],
      enabled: true,
    });

    this.register({
      name: 'CopywritingAgent',
      version: 'v1.0',
      description: 'Crafts platform-native copy with tailored hooks, body text, CTAs, and hashtags.',
      executionMode: 'model-driven',
      category: 'STRATEGY_CREATION',
      status: 'AVAILABLE',
      tag: 'Platform Copywriting',
      responsibilities: 'Crafts platform-native copy with tailored hooks, body text, bullet points, call-to-actions, and hashtag recommendations.',
      inputs: 'ContentItem core idea, channel role, brand tone guidelines, character limit constraints.',
      outputs: 'ContentVariant objects for LinkedIn, Facebook, Instagram, and Telegram.',
      exampleResult: 'LinkedIn Variant Generated: Hook emphasizing single prompt limitations + 3 technical bullet points + CTA.',
      allowedTools: ['modelGateway'],
      enabled: true,
    });

    this.register({
      name: 'ImageAgent',
      version: 'v1.0',
      description: 'Generates detailed visual concepts and prompts for high-resolution social graphics.',
      executionMode: 'model-driven',
      category: 'STRATEGY_CREATION',
      status: 'AVAILABLE',
      tag: 'Image Briefs',
      responsibilities: 'Generates detailed prompts and visual concept briefs for high-resolution static social graphics.',
      inputs: 'Post copy, brand colors, aspect ratios (1:1, 16:9).',
      outputs: 'ImageBriefJson with prompt parameters, lighting, and composition specs.',
      exampleResult: 'Generated 1:1 image prompt: 3D render of glowing neural node network in enterprise dark purple aesthetic.',
      allowedTools: ['imagen3Provider'],
      enabled: true,
    });

    this.register({
      name: 'CarouselAgent',
      version: 'v1.0',
      description: 'Structures multi-slide PDF carousel presentations with slide titles and visual directions.',
      executionMode: 'hybrid',
      category: 'STRATEGY_CREATION',
      status: 'AVAILABLE',
      tag: 'Slide Decks',
      responsibilities: 'Structures multi-slide PDF carousel presentations with slide titles, concise copy, and visual slide directions.',
      inputs: 'Core takeaway, audience persona, brand voice rules.',
      outputs: 'CarouselSlidesJson array (Cover slide, Key takeaway slides, Summary CTA slide).',
      exampleResult: 'Generated 4-slide deck: "5 Rules for Scaling Enterprise AI Content".',
      allowedTools: ['carouselBuilder'],
      enabled: true,
    });

    this.register({
      name: 'InfographicAgent',
      version: 'v1.0',
      description: 'Extracts statistics and constructs visual flowchart directions and data breakdowns.',
      executionMode: 'hybrid',
      category: 'STRATEGY_CREATION',
      status: 'AVAILABLE',
      tag: 'Data Visualization',
      responsibilities: 'Extracts statistics and constructs visual flowchart directions and data breakdown infographics.',
      inputs: 'Whitepaper data points, statistical metrics.',
      outputs: 'InfographicSpecsJson with step-by-step visual flow, stat callouts, and icon mapping.',
      exampleResult: 'Structured 3-step visual flowchart comparing Single LLM prompts vs Multi-Agent OS.',
      allowedTools: ['infographicBuilder'],
      enabled: true,
    });

    this.register({
      name: 'StaticVisualAgent',
      version: 'v1.0',
      description: 'Generates minimalist quote and stat callout graphics adhering to brand guidelines.',
      executionMode: 'deterministic',
      category: 'STRATEGY_CREATION',
      status: 'AVAILABLE',
      tag: 'Quote Cards',
      responsibilities: 'Generates minimalist quote and stat callout graphics adhering to corporate visual guidelines.',
      inputs: 'Key quote, author title, brand color tokens.',
      outputs: 'StaticVisualJson layout spec for instant rendering.',
      exampleResult: 'Generated executive quote card layout: "Single LLM prompts don\'t scale in enterprise production."',
      allowedTools: ['quoteCardRenderer'],
      enabled: true,
    });

    this.register({
      name: 'VideoAgent',
      version: 'v1.0',
      description: 'Generates structured short-form video storyboards, voiceover scripts, and B-roll directions.',
      executionMode: 'hybrid',
      category: 'STRATEGY_CREATION',
      status: 'AVAILABLE',
      tag: 'Video Packages',
      responsibilities: 'Generates short-form video storyboards, scene sequences, voiceover scripts, text overlays, and thumbnail briefs.',
      inputs: 'Topic, target duration (30-60s), aspect ratio (9:16).',
      outputs: 'VideoPackage JSON with timed scene sequences, B-roll tags, and subtitle captions.',
      exampleResult: 'Generated 45s Reel package with 3 scene cuts, text overlays, and voiceover script.',
      allowedTools: ['videoRenderingProvider'],
      enabled: true,
      handler: (t) => videoAgent.execute(t),
    });

    // 3. TRUST & GOVERNANCE AGENTS
    this.register({
      name: 'FactVerificationAgent',
      version: 'v1.0',
      description: 'Cross-checks generated claims against ingested RAG chunks to compute factual risk scores.',
      executionMode: 'retrieval-driven',
      category: 'TRUST_GOVERNANCE',
      status: 'AVAILABLE',
      tag: 'Grounding Audit',
      responsibilities: 'Cross-checks generated claims against ingested RAG whitepaper chunks to compute factual risk ratings.',
      inputs: 'Draft copy, grounded knowledge chunks.',
      outputs: 'Factual risk score (0-100), verified evidence citations, hallucination flags.',
      exampleResult: 'Verified claim "80% content velocity reduction" against Doc #402, Chunk #14. Factual Risk: 4%.',
      allowedTools: ['vectorRetriever', 'claimVerifier'],
      enabled: true,
    });

    this.register({
      name: 'ComplianceAgent',
      version: 'v1.0',
      description: 'Enforces mandatory legal disclaimers, prohibited terms, and regulatory compliance checks.',
      executionMode: 'deterministic',
      category: 'TRUST_GOVERNANCE',
      status: 'AVAILABLE',
      tag: 'Legal Guardrails',
      responsibilities: 'Enforces mandatory legal disclaimers, prohibited terms, and regulatory compliance checks.',
      inputs: 'Draft copy, brand disclaimers, prohibited phrases list.',
      outputs: 'Compliance score (0-100), missing disclaimers list, prohibited terms found.',
      exampleResult: 'Compliance Rating: 100%. Validated mandatory disclaimer and verified 0 prohibited terms.',
      allowedTools: ['disclaimerMatcher', 'prohibitedTermFilter'],
      enabled: true,
    });

    this.register({
      name: 'BrandCriticAgent',
      version: 'v1.0',
      description: 'Evaluates copy for brand voice alignment, vocabulary appropriateness, and style rules.',
      executionMode: 'hybrid',
      category: 'TRUST_GOVERNANCE',
      status: 'AVAILABLE',
      tag: 'Tone Scoring',
      responsibilities: 'Evaluates copy for brand voice alignment, vocabulary appropriateness, and style guide adherence.',
      inputs: 'Draft copy, brand tone parameters, preferred vocabulary.',
      outputs: 'Brand Voice Score (0-100), tone critiques, suggested vocabulary swaps.',
      exampleResult: 'Brand Voice Score: 96/100. Tone evaluated as Authoritative, Technical, and Enterprise-grade.',
      allowedTools: ['styleEvaluator'],
      enabled: true,
    });

    this.register({
      name: 'AccessibilityAgent',
      version: 'v1.0',
      description: 'Audits visual alt-text, readability index, and color contrast compliance.',
      executionMode: 'deterministic',
      category: 'TRUST_GOVERNANCE',
      status: 'AVAILABLE',
      tag: 'Accessibility & Alt-Text',
      responsibilities: 'Audits visual alt-text, readability index, and color contrast compliance for inclusive delivery.',
      inputs: 'ContentVariant altText, visual concepts, text complexity.',
      outputs: 'Accessibility score (0-100), alt-text quality rating, WCAG compliance notes.',
      exampleResult: 'Accessibility Score: 98/100. Alt-text validated for screen reader clarity.',
      allowedTools: ['wcagAuditor'],
      enabled: true,
    });

    this.register({
      name: 'SeoDiscoveryAgent',
      version: 'v1.0',
      description: 'Identifies high-intent search terms, topical clusters, and hashtag optimization.',
      executionMode: 'hybrid',
      category: 'TRUST_GOVERNANCE',
      status: 'AVAILABLE',
      tag: 'Keyword Intent',
      responsibilities: 'Identifies high-intent search terms, topical authority clusters, and channel hashtag optimization.',
      inputs: 'Core topic, audience locale, seed keywords.',
      outputs: 'Keyword clusters, primary/secondary hashtags, search intent map.',
      exampleResult: 'Discovered high-intent cluster: #EnterpriseAI, #MultiAgentOS, #SoftwareArchitecture.',
      allowedTools: ['keywordExplorer'],
      enabled: true,
    });

    this.register({
      name: 'ReviewAgent',
      version: 'v1.0',
      description: 'Quality Council Coordinator aggregating Fact, Compliance, Brand Critic, and SEO scores.',
      executionMode: 'hybrid',
      category: 'TRUST_GOVERNANCE',
      status: 'AVAILABLE',
      tag: 'Council Orchestrator',
      responsibilities: 'Combines outputs from Fact, Compliance, and Brand Critic agents to issue final Quality Council decisions.',
      inputs: 'ContentVariant, brand guardrails, duplicate post embeddings.',
      outputs: 'ReviewResult entity with overall status (passed, needs_revision, blocked).',
      exampleResult: 'Quality Council Decision: PASSED. Overall confidence: 0.98.',
      allowedTools: ['qualityCouncilEvaluator'],
      enabled: true,
    });

    this.register({
      name: 'CostGovernanceAgent',
      version: 'v1.0',
      description: 'Enforces budget limits, model tier routing, and cost governance rules.',
      executionMode: 'deterministic',
      category: 'TRUST_GOVERNANCE',
      status: 'AVAILABLE',
      tag: 'Budget & Tier Routing',
      responsibilities: 'Monitors token budgets, enforces USD spend limits, and routes tasks to optimal LLM model tiers.',
      inputs: 'Task complexity, risk category, monthly budget usage.',
      outputs: 'Cost usage records, model tier assignments, budget warning alerts.',
      exampleResult: 'Assigned "Standard" tier (Gemini 2.5 Flash) for copy generation. Budget usage: $14.20 / $500 monthly limit.',
      inputSchema: z.object({ taskComplexity: z.enum(['LOW', 'MEDIUM', 'HIGH']), riskCategory: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']) }),
      outputSchema: CostDecisionSchema,
      allowedTools: ['modelGateway'],
      enabled: true,
      handler: (t) => costGovernanceAgent.execute(t),
    });

    this.register({
      name: 'IncidentAgent',
      version: 'v1.0',
      description: 'Monitors automated execution anomalies, rate limit spikes, and policy violations.',
      executionMode: 'deterministic',
      category: 'TRUST_GOVERNANCE',
      status: 'AVAILABLE',
      tag: 'Incident Governance',
      responsibilities: 'Detects execution anomalies, logs severity alerts, and enforces circuit breakers.',
      inputs: 'Error logs, system health events, threshold limits.',
      outputs: 'IncidentRecord, circuit breaker status, resolution actions.',
      exampleResult: 'No active incidents detected. Circuit breaker state: CLOSED (Normal Operations).',
      allowedTools: ['telemetryService'],
      enabled: true,
    });

    // 4. EXECUTION & LEARNING AGENTS
    this.register({
      name: 'SchedulingAgent',
      version: 'v1.0',
      description: 'Checks audience timezone optimal windows and channel collision constraints.',
      executionMode: 'hybrid',
      category: 'EXECUTION_LEARNING',
      status: 'AVAILABLE',
      tag: 'Cadence & Collision',
      responsibilities: 'Checks audience timezone optimal windows, channel overposting constraints, and queues approved content.',
      inputs: 'Approved ContentItems, brand timezone preferences, minimum channel buffer hours.',
      outputs: 'Schedule items assigned to UTC timestamps.',
      exampleResult: 'Scheduled LinkedIn Post for Monday 14:00 UTC (Optimal engagement window, zero channel collisions).',
      allowedTools: ['calendarScheduler'],
      enabled: true,
    });

    this.register({
      name: 'PublishingAgent',
      version: 'v1.0',
      description: 'Executes idempotent API requests to official LinkedIn, Meta, and Telegram connectors.',
      executionMode: 'deterministic',
      category: 'EXECUTION_LEARNING',
      status: 'AVAILABLE',
      tag: 'OAuth Connectors',
      responsibilities: 'Executes idempotent API network requests to connected platforms using AES-256 tokens.',
      inputs: 'Scheduled item, encrypted OAuth tokens, idempotency key.',
      outputs: 'Publication record with external post ID, permalink, HTTP response status.',
      exampleResult: 'Published to LinkedIn REST API: Status 201 Created. Idempotency Key: pub_idemp_9f82a1.',
      allowedTools: ['publishingRouter'],
      enabled: true,
    });

    this.register({
      name: 'AnalyticsAgent',
      version: 'v1.0',
      description: 'Explains content performance against baselines and identifies bottlenecks.',
      executionMode: 'hybrid',
      category: 'EXECUTION_LEARNING',
      status: 'AVAILABLE',
      tag: 'Metrics Normalization',
      responsibilities: 'Ingests social API metric events and normalizes impressions, reach, CTR, and engagements.',
      inputs: 'Raw platform metric payloads, publication ledger IDs.',
      outputs: 'NormalizedMetricEvent records, performance baselines.',
      exampleResult: 'Normalized 14,250 LinkedIn impressions and 320 clicks into unified metric schema.',
      inputSchema: z.object({ brandId: z.string(), campaignId: z.string().optional() }),
      outputSchema: AnalyticsReportSchema,
      allowedTools: ['analyticsIngestionService'],
      enabled: true,
      handler: (t) => analyticsAgent.execute(t),
    });

    this.register({
      name: 'OptimizationAgent',
      version: 'v2.0',
      description: 'Proposes next-post recommendations and manages recommendation lifecycles.',
      executionMode: 'hybrid',
      category: 'EXECUTION_LEARNING',
      status: 'AVAILABLE',
      tag: 'Causal Learning',
      responsibilities: 'Monitors post impression data, calculates engagement rates, tracks creative fatigue, and generates recommendations.',
      inputs: 'NormalizedMetricEvents, publication ledger, performance decay curves.',
      outputs: 'Performance snapshots, fatigue warnings, AI recommendations.',
      exampleResult: 'Causal Memory Updated: "Technical Architecture" pillar yields 38% higher CTR on LinkedIn.',
      inputSchema: z.object({ brandId: z.string(), campaignId: z.string().optional() }),
      outputSchema: RecommendationSchema,
      allowedTools: ['learningMemoryService'],
      enabled: true,
      handler: (t) => optimizationAgent.execute(t),
    });

    this.register({
      name: 'ExperimentAgent',
      version: 'v1.0',
      description: 'Designs and evaluates controlled growth experiments and multi-armed bandit allocations.',
      executionMode: 'hybrid',
      category: 'EXECUTION_LEARNING',
      status: 'AVAILABLE',
      tag: 'A/B & Bandit Testing',
      responsibilities: 'Designs, executes, and statistically evaluates content variant experiments.',
      inputs: 'Hypothesis, primary metric, target population, variants.',
      outputs: 'Experiment design, sample size requirements, winning variant evaluation.',
      exampleResult: 'Concluded Experiment: Variant B (Technical Hook) achieved +42% conversion lift over Variant A.',
      inputSchema: z.object({ brandId: z.string(), hypothesis: z.string(), primaryMetric: z.string() }),
      outputSchema: ExperimentDesignSchema,
      allowedTools: ['statisticalEvaluator'],
      enabled: true,
      handler: (t) => experimentAgent.execute(t),
    });

    this.register({
      name: 'CommunityAgent',
      version: 'v1.0',
      description: 'Classifies community interactions, drafts responses, and escalates sensitive issues.',
      executionMode: 'hybrid',
      category: 'EXECUTION_LEARNING',
      status: 'AVAILABLE',
      tag: 'Inbox & Moderation',
      responsibilities: 'Classifies incoming comments and messages, drafts suggested responses, and escalates sensitive issues.',
      inputs: 'Incoming social comments, brand tone guardrails, escalation policies.',
      outputs: 'Message classification (Positive, Lead, Support, Crisis), drafted response.',
      exampleResult: 'Classified message as "SALES_LEAD", drafted response, and queued for review.',
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
      category: 'EXECUTION_LEARNING',
      status: 'AVAILABLE',
      tag: 'Transcreation & Locales',
      responsibilities: 'Adapts approved source content into target locales with transcreation and lineage.',
      inputs: 'Source content ID, target locale, personality parameters.',
      outputs: 'LocalizedContent entity with transcreation notes and policy status.',
      exampleResult: 'Transcreated post to es-ES with cultural tone adjustments. Lineage tracked.',
      inputSchema: z.object({ sourceContentId: z.string(), sourceLocale: z.string(), targetLocale: z.string(), bodyText: z.string(), ctaText: z.string(), brandPersonality: z.string() }),
      outputSchema: LocalizationSchema,
      allowedTools: ['modelGateway'],
      enabled: true,
      handler: (t) => localizationAgent.execute(t),
    });

    this.register({
      name: 'OrchestratorAgent',
      version: 'v1.0',
      description: 'Master multi-agent campaign orchestrator coordinating research, strategy, copywriting, and quality gates.',
      executionMode: 'hybrid',
      category: 'EXECUTION_LEARNING',
      status: 'AVAILABLE',
      tag: 'Master Orchestration',
      responsibilities: 'Coordinates end-to-end execution across Strategy, Copywriting, Visual, and Quality Council agents.',
      inputs: 'Campaign ID, brand ID, wizard parameters.',
      outputs: 'CampaignLifecycleState, generated variants, review status.',
      exampleResult: 'Orchestrated full campaign generation across 4 channels with zero policy violations.',
      allowedTools: ['strategyAgent', 'copywritingAgent', 'reviewAgent'],
      enabled: true,
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

    if (agent.inputSchema) {
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
    }

    if (!agent.handler) {
      throw new AgentError({
        code: 'AGENT_NOT_IMPLEMENTED',
        message: `Agent '${agentName}' handler function is not defined.`,
        agentName,
        taskId: task.taskId,
        isRetryable: false,
        tenantId: task.tenantId,
        brandId: task.brandId,
      });
    }

    let attempts = 0;
    const maxAttempts = 3;
    let lastError: any = null;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const result = await agent.handler(task);

        if (result.output && (result.status === 'completed' || result.status === 'needs_revision') && agent.outputSchema) {
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

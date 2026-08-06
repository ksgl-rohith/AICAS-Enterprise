'use client';

import React, { useState } from 'react';
import {
  Building2,
  TrendingUp,
  Target,
  CalendarDays,
  PenTool,
  Palette,
  ShieldCheck,
  Clock,
  Send,
  BarChart3,
  Bot,
  Sparkles,
  FileText,
  Search,
  PieChart,
  Video,
  Image as ImageIcon,
  CheckCircle,
  FlaskConical,
  DollarSign,
  MessageSquare,
  Globe,
  AlertTriangle,
  Layers,
} from 'lucide-react';

export function AgentShowcaseSection() {
  const agents = [
    {
      id: 'brand-context',
      name: 'Brand Context Agent',
      codeName: 'BrandContextAgent',
      icon: Building2,
      color: 'from-indigo-500 to-blue-600',
      tag: 'Brand DNA Memory',
      responsibilities: 'Maintains brand memory, tone rules, preferred/prohibited vocabulary, and executes RAG vector chunk retrieval from uploaded whitepapers.',
      inputs: 'Brand profiles, PDF/Markdown whitepapers, competitor positioning, tone parameters.',
      outputs: 'Grounded context object, active tone guardrails, retrieved document evidence citations.',
      exampleResult: 'Retrieved Chunk #14 from whitepaper: "Enterprise AI reduces content velocity lag by 80%." Enforced tone: Authoritative & Technical.',
    },
    {
      id: 'ingestion',
      name: 'Ingestion Agent',
      codeName: 'IngestionAgent',
      icon: FileText,
      color: 'from-blue-500 to-cyan-600',
      tag: 'Document Ingestion',
      responsibilities: 'Parses enterprise PDFs, Markdown files, and URLs into structured text chunks and vector embeddings.',
      inputs: 'Raw documents (PDF, TXT, MD), brand ID.',
      outputs: 'Vector chunks with cosine similarity metadata and character offsets.',
      exampleResult: 'Indexed document "Enterprise_AI_Whitepaper_2026.pdf" into 42 vector chunks.',
    },
    {
      id: 'trend',
      name: 'Trend Intelligence Agent',
      codeName: 'TrendIntelligenceAgent',
      icon: TrendingUp,
      color: 'from-purple-500 to-indigo-600',
      tag: 'Signal Mining',
      responsibilities: 'Processes macro industry trends, GDELT signals, and topical relevance to identify high-opportunity content angles.',
      inputs: 'GDELT news feeds, industry topic keywords, target market verticals.',
      outputs: 'TrendSignal objects with opportunity score, freshness score, and strategic summary.',
      exampleResult: 'Detected Signal: "Agentic AI Infrastructure in Enterprise IT". Opportunity Score: 0.92, Freshness Score: 0.98.',
    },
    {
      id: 'market-research',
      name: 'Market Research Agent',
      codeName: 'MarketResearchAgent',
      icon: Search,
      color: 'from-violet-500 to-purple-600',
      tag: 'Persona Positioning',
      responsibilities: 'Analyzes target audience demographics, pain points, decision drivers, and competitor gap positioning.',
      inputs: 'Industry vertical, target personas, product capabilities.',
      outputs: 'Audience summary, positioning map, and competitor counter-arguments.',
      exampleResult: 'Mapped 3 CTO pain points: compliance risk, brand voice drift, and manual review bottlenecks.',
    },
    {
      id: 'seo-discovery',
      name: 'SEO Discovery Agent',
      codeName: 'SeoDiscoveryAgent',
      icon: Search,
      color: 'from-cyan-500 to-teal-600',
      tag: 'Keyword Intent',
      responsibilities: 'Identifies high-intent search terms, topical authority clusters, and channel hashtag optimization.',
      inputs: 'Core topic, audience locale, seed keywords.',
      outputs: 'Keyword clusters, primary/secondary hashtags, search intent map.',
      exampleResult: 'Discovered high-intent cluster: #EnterpriseAI, #MultiAgentOS, #SoftwareArchitecture.',
    },
    {
      id: 'strategy',
      name: 'Strategy Agent',
      codeName: 'StrategyAgent',
      icon: Target,
      color: 'from-pink-500 to-rose-600',
      tag: 'Pillar Mapping',
      responsibilities: 'Translates high-level campaign objectives into actionable content pillar breakdowns and channel role assignments.',
      inputs: 'Campaign wizard goals, audience personas, trend signals, brand guardrails.',
      outputs: 'CampaignStrategy narrative, content pillars, channel roles, constraint mappings.',
      exampleResult: 'Generated Strategy: 3 Pillars (Agentic Architecture, Security/Compliance, ROI Case Studies) assigned across LinkedIn & Instagram.',
    },
    {
      id: 'planner',
      name: 'Content Planning Agent',
      codeName: 'ContentPlanningAgent',
      icon: CalendarDays,
      color: 'from-amber-500 to-orange-600',
      tag: 'Format Mix Matrix',
      responsibilities: 'Determines the optimal format distribution (text, image, carousel, video) and posting cadence per social channel.',
      inputs: 'Campaign strategy pillars, historical channel engagement weights, target date windows.',
      outputs: 'ContentItem draft entities mapped to specific formats and target delivery dates.',
      exampleResult: 'Planned 6 items: 3 LinkedIn text posts, 2 Instagram visual briefs, 1 short-form video script.',
    },
    {
      id: 'copywriter',
      name: 'Copywriting Agent',
      codeName: 'CopywritingAgent',
      icon: PenTool,
      color: 'from-emerald-500 to-teal-600',
      tag: 'Platform Transcreation',
      responsibilities: 'Crafts platform-native copy with tailored hooks, body text, bullet points, call-to-actions, and hashtag recommendations.',
      inputs: 'ContentItem core idea, channel role, brand tone guidelines, character limit constraints.',
      outputs: 'ContentVariant objects for LinkedIn, Facebook, Instagram, and Telegram.',
      exampleResult: 'LinkedIn Variant Generated: Hook emphasizing single prompt limitations + 3 technical bullet points + CTA.',
    },
    {
      id: 'image-content',
      name: 'Image Content Agent',
      codeName: 'ImageContentAgent',
      icon: ImageIcon,
      color: 'from-pink-500 to-purple-600',
      tag: 'Image Briefs',
      responsibilities: 'Generates detailed prompts and visual concept briefs for high-resolution static social graphics.',
      inputs: 'Post copy, brand colors, aspect ratios (1:1, 16:9).',
      outputs: 'ImageBriefJson with prompt parameters, lighting, and composition specs.',
      exampleResult: 'Generated 1:1 image prompt: 3D render of glowing neural node network in enterprise dark purple aesthetic.',
    },
    {
      id: 'carousel',
      name: 'Carousel Agent',
      codeName: 'CarouselAgent',
      icon: Layers,
      color: 'from-indigo-600 to-violet-600',
      tag: 'Slide Decks',
      responsibilities: 'Structures multi-slide PDF carousel presentations with slide titles, concise copy, and visual slide directions.',
      inputs: 'Core takeaway, audience persona, brand voice rules.',
      outputs: 'CarouselSlidesJson array (Cover slide, Key takeaway slides, Summary CTA slide).',
      exampleResult: 'Generated 4-slide deck: "5 Rules for Scaling Enterprise AI Content".',
    },
    {
      id: 'infographic',
      name: 'Infographic Agent',
      codeName: 'InfographicAgent',
      icon: PieChart,
      color: 'from-amber-600 to-yellow-600',
      tag: 'Data Visualization',
      responsibilities: 'Extracts statistics and constructs visual flowchart directions and data breakdown infographics.',
      inputs: 'Whitepaper data points, statistical metrics.',
      outputs: 'InfographicSpecsJson with step-by-step visual flow, stat callouts, and icon mapping.',
      exampleResult: 'Structured 3-step visual flowchart comparing Single LLM prompts vs Multi-Agent OS.',
    },
    {
      id: 'static-visual',
      name: 'Static Visual Agent',
      codeName: 'StaticVisualAgent',
      icon: ImageIcon,
      color: 'from-blue-600 to-cyan-600',
      tag: 'Quote Cards',
      responsibilities: 'Generates minimalist quote and stat callout graphics adhering to corporate visual guidelines.',
      inputs: 'Key quote, author title, brand color tokens.',
      outputs: 'StaticVisualJson layout spec for instant rendering.',
      exampleResult: 'Generated executive quote card layout: "Single LLM prompts don\'t scale in enterprise production."',
    },
    {
      id: 'video',
      name: 'Video Agent',
      codeName: 'VideoAgent',
      icon: Video,
      color: 'from-emerald-600 to-teal-600',
      tag: 'Video Packages',
      responsibilities: 'Generates short-form video storyboards, scene sequences, voiceover scripts, text overlays, and thumbnail briefs.',
      inputs: 'Topic, target duration (30-60s), aspect ratio (9:16).',
      outputs: 'VideoPackage JSON with timed scene sequences, B-roll tags, and subtitle captions.',
      exampleResult: 'Generated 45s Reel package with 3 scene cuts, text overlays, and voiceover script.',
    },
    {
      id: 'fact-verification',
      name: 'Fact Verification Agent',
      codeName: 'FactVerificationAgent',
      icon: CheckCircle,
      color: 'from-emerald-500 to-green-600',
      tag: 'Grounding Verification',
      responsibilities: 'Cross-checks generated claims against ingested RAG whitepaper chunks to compute factual risk ratings.',
      inputs: 'Draft copy, grounded knowledge chunks.',
      outputs: 'Factual risk score (0-100), verified evidence citations, hallucination flags.',
      exampleResult: 'Verified claim "80% content velocity reduction" against Doc #402, Chunk #14. Factual Risk: 4%.',
    },
    {
      id: 'compliance',
      name: 'Compliance Agent',
      codeName: 'ComplianceAgent',
      icon: ShieldCheck,
      color: 'from-red-500 to-amber-600',
      tag: 'Legal Guardrails',
      responsibilities: 'Enforces mandatory legal disclaimers, prohibited terms, and regulatory compliance checks.',
      inputs: 'Draft copy, brand disclaimers, prohibited phrases list.',
      outputs: 'Compliance score (0-100), missing disclaimers list, prohibited terms found.',
      exampleResult: 'Compliance Rating: 100%. Validated mandatory disclaimer and verified 0 prohibited terms.',
    },
    {
      id: 'brand-critic',
      name: 'Brand Critic Agent',
      codeName: 'BrandCriticAgent',
      icon: ShieldCheck,
      color: 'from-purple-500 to-pink-600',
      tag: 'Tone Scoring',
      responsibilities: 'Evaluates copy for brand voice alignment, vocabulary appropriateness, and style guide adherence.',
      inputs: 'Draft copy, brand tone parameters, preferred vocabulary.',
      outputs: 'Brand Voice Score (0-100), tone critiques, suggested vocabulary swaps.',
      exampleResult: 'Brand Voice Score: 96/100. Tone evaluated as Authoritative, Technical, and Enterprise-grade.',
    },
    {
      id: 'review-orchestrator',
      name: 'Review Agent',
      codeName: 'ReviewAgent',
      icon: ShieldCheck,
      color: 'from-red-600 to-rose-700',
      tag: 'Council Orchestrator',
      responsibilities: 'Combines outputs from Fact, Compliance, and Brand Critic agents to issue final Quality Council decisions.',
      inputs: 'ContentVariant, brand guardrails, duplicate post embeddings.',
      outputs: 'ReviewResult entity with overall status (passed, needs_revision, blocked).',
      exampleResult: 'Quality Council Decision: PASSED. Overall confidence: 0.98.',
    },
    {
      id: 'scheduling',
      name: 'Scheduling Agent',
      codeName: 'SchedulingAgent',
      icon: Clock,
      color: 'from-violet-500 to-purple-600',
      tag: 'Cadence & Collision',
      responsibilities: 'Checks audience timezone optimal windows, channel overposting constraints, and queues approved content into the calendar schedule.',
      inputs: 'Approved ContentItems, brand timezone preferences, minimum channel buffer hours.',
      outputs: 'Schedule items assigned to UTC timestamps.',
      exampleResult: 'Scheduled LinkedIn Post for Monday 14:00 UTC (Optimal engagement window, zero channel collisions).',
    },
    {
      id: 'publishing',
      name: 'Publishing Agent',
      codeName: 'PublishingAgent',
      icon: Send,
      color: 'from-blue-600 to-indigo-700',
      tag: 'OAuth Connectors',
      responsibilities: 'Executes idempotent API network requests to official LinkedIn REST, Meta Graph API, and Telegram Bot API using AES-256 tokens.',
      inputs: 'Scheduled item, encrypted OAuth tokens, idempotency key (pub_idemp_xxx).',
      outputs: 'Publication record with external post ID, permalink, HTTP response status.',
      exampleResult: 'Published to LinkedIn REST API: Status 201 Created. Idempotency Key: pub_idemp_9f82a1.',
    },
    {
      id: 'analytics',
      name: 'Analytics Agent',
      codeName: 'AnalyticsAgent',
      icon: BarChart3,
      color: 'from-cyan-600 to-blue-600',
      tag: 'Metrics Normalization',
      responsibilities: 'Ingests social API metric events and normalizes impressions, reach, CTR, and engagements across all connected platforms.',
      inputs: 'Raw platform metric payloads, publication ledger IDs.',
      outputs: 'NormalizedMetricEvent records, performance baselines.',
      exampleResult: 'Normalized 14,250 LinkedIn impressions and 320 clicks into unified metric schema.',
    },
    {
      id: 'optimization',
      name: 'Optimization Agent',
      codeName: 'OptimizationAgent',
      icon: BarChart3,
      color: 'from-emerald-600 to-green-500',
      tag: 'Causal Learning',
      responsibilities: 'Monitors post impression data, calculates normalized engagement rates, tracks creative fatigue, and generates next-best post suggestions.',
      inputs: 'NormalizedMetricEvents, publication ledger, performance decay curves.',
      outputs: 'Performance snapshots, fatigue warnings, AI recommendations.',
      exampleResult: 'Causal Memory Updated: "Technical Architecture" pillar yields 38% higher CTR on LinkedIn. Recommendation pushed.',
    },
    {
      id: 'experiment',
      name: 'Experiment Agent',
      codeName: 'ExperimentAgent',
      icon: FlaskConical,
      color: 'from-indigo-600 to-purple-600',
      tag: 'A/B & Bandit Testing',
      responsibilities: 'Designs, executes, and statistically evaluates content variant experiments and multi-armed bandit allocations.',
      inputs: 'Hypothesis, primary metric, target population, variants.',
      outputs: 'Experiment design, sample size requirements, winning variant evaluation.',
      exampleResult: 'Concluded Experiment: Variant B (Technical Hook) achieved +42% conversion lift over Variant A.',
    },
    {
      id: 'cost-governance',
      name: 'Cost Governance Agent',
      codeName: 'CostGovernanceAgent',
      icon: DollarSign,
      color: 'from-emerald-600 to-teal-600',
      tag: 'Budget & Tier Routing',
      responsibilities: 'Monitors token budgets, enforces USD spend limits, and routes tasks to optimal LLM model tiers (Economy, Standard, Premium).',
      inputs: 'Task complexity, risk category, monthly budget usage.',
      outputs: 'Cost usage records, model tier assignments, budget warning alerts.',
      exampleResult: 'Assigned "Standard" tier (Gemini 2.5 Flash) for copy generation. Budget usage: $14.20 / $500 monthly limit.',
    },
    {
      id: 'community',
      name: 'Community Agent',
      codeName: 'CommunityAgent',
      icon: MessageSquare,
      color: 'from-rose-500 to-red-600',
      tag: 'Inbox & Moderation',
      responsibilities: 'Classifies incoming comments and messages, drafts suggested responses, and escalates sensitive issues to human managers.',
      inputs: 'Incoming social comments, brand tone guardrails, escalation policies.',
      outputs: 'Message classification (Positive, Lead, Support, Crisis), drafted response.',
      exampleResult: 'Classified message as "SALES_LEAD", drafted response, and queued for community manager review.',
    },
  ];

  const [selectedAgentId, setSelectedAgentId] = useState<string>('brand-context');
  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  return (
    <section id="agents" className="py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-50 border-y border-slate-200/60 rounded-3xl my-6">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-4">
          <Bot className="w-3.5 h-3.5" />
          <span>Multi-Agent System Architecture</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
          24 Specialized AI Agents. Synchronized Collaboration.
        </h2>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          Click any of our 24 specialized AI agents in the codebase to inspect its exact responsibilities, input parameters, generated outputs, and real execution results.
        </p>
      </div>

      {/* Grid of 24 Agents */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
        {agents.map((agent) => {
          const Icon = agent.icon;
          const isSelected = agent.id === selectedAgentId;
          return (
            <button
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group ${
                isSelected
                  ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/30 scale-[1.03]'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div>
                <div
                  className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${agent.color} flex items-center justify-center text-white mb-2 shadow-xs group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900 line-clamp-1">{agent.name}</div>
                <div className="text-[9px] text-indigo-600 font-mono font-semibold truncate mt-0.5">{agent.codeName}</div>
              </div>
              <div className="mt-2 text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 w-max border border-slate-200">
                {agent.tag}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Agent Inspector Drawer / Card */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${selectedAgent.color} flex items-center justify-center text-white shadow-md`}>
              {React.createElement(selectedAgent.icon, { className: 'w-7 h-7' })}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{selectedAgent.name}</h3>
              <p className="text-xs text-indigo-600 font-mono font-semibold mt-0.5">
                Class: {selectedAgent.codeName} • Model Gateway: Gemini 2.5 Flash
              </p>
            </div>
          </div>

          <span className="px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-mono font-semibold border border-indigo-200 self-start md:self-auto">
            Role: {selectedAgent.tag}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-xs">
          {/* Column 1: Responsibilities & Inputs */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Responsibilities</span>
              <p className="text-slate-800 leading-relaxed">{selectedAgent.responsibilities}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Inputs</span>
              <p className="text-slate-700 font-mono text-[11px] leading-relaxed">{selectedAgent.inputs}</p>
            </div>
          </div>

          {/* Column 2: Outputs */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 h-full">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 block">Generated Outputs</span>
              <p className="text-slate-700 font-mono text-[11px] leading-relaxed">{selectedAgent.outputs}</p>
              <div className="pt-2 text-[10px] text-slate-500">
                All outputs pass through the Quality Review Council schema before persistence.
              </div>
            </div>
          </div>

          {/* Column 3: Example Result */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-2 h-full">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Real Execution Result
              </span>
              <p className="text-slate-800 font-mono text-[11px] leading-relaxed p-3 rounded-xl bg-white border border-indigo-200 shadow-xs">
                {selectedAgent.exampleResult}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Megaphone,
  CheckCircle2,
  CalendarDays,
  Settings,
  BarChart3,
  Sparkles,
  ArrowRight,
  Check,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

export function AppWalkthroughSection() {
  const screens = [
    {
      id: 'dashboard',
      name: 'Executive Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      purpose: 'Central command center providing executive visibility into campaign performance, autonomous agent status, and upcoming scheduled publications.',
      features: [
        'Real-time KPI metrics (Reach, Engagements, CTR, Brand Voice Score)',
        'Active Campaign Pipeline status & oversight mode switches',
        'Recent System Audit Log feed with immutable event history',
        'Quick launcher for multi-channel campaign wizard',
      ],
      userActions: [
        'Monitor operational health across all connected social brands',
        'Review pending high-risk content approvals',
        'Switch AI Engine between Gemini 2.5 Flash and sandbox fallback',
      ],
      businessValue: 'Eliminates blind spots in enterprise marketing operations and accelerates campaign execution by 80%.',
      mockupData: {
        title: 'Executive Overview',
        badge: 'Controlled Autonomy Mode',
        kpis: [
          { label: 'Total Reach', val: '142,850', change: '+24.5%' },
          { label: 'Avg Engagement Rate', val: '4.82%', change: '+1.2%' },
          { label: 'Avg Brand Voice Score', val: '96/100', change: 'Optimal' },
          { label: 'Scheduled Posts', val: '18 Active', change: 'Synced' },
        ],
        activity: [
          { time: '10m ago', text: 'StrategyAgent finalized narrative for "Q3 Enterprise AI Launch"' },
          { time: '25m ago', text: 'ReviewAgent approved LinkedIn post with 98% compliance score' },
          { time: '1h ago', text: 'PublishingAgent posted carousel to LinkedIn API (pub_9f2a81)' },
        ],
      },
    },
    {
      id: 'brands',
      name: 'Brand DNA & Knowledge RAG',
      href: '/brands',
      icon: Building2,
      purpose: 'Establish multi-brand guardrails, tone profiles, prohibited phrases, required disclaimers, and ingest whitepaper PDFs into vector knowledge chunks.',
      features: [
        'Multi-brand profile management with primary tone & audience parameters',
        'Strict prohibited vocabulary lists & mandatory compliance disclaimers',
        'PDF, Markdown, and TXT grounded document ingestion (RAG vector chunks)',
        'Competitor positioning and target market definitions',
      ],
      userActions: [
        'Upload enterprise PDF whitepapers for retrieval-augmented generation',
        'Configure prohibited phrases to prevent brand voice drift',
        'Set mandatory disclaimers for regulated industry compliance',
      ],
      businessValue: 'Ensures 100% brand voice fidelity and prevents factual hallucinations by grounding AI in verified company whitepapers.',
      mockupData: {
        title: 'Brand Profile: ApexAI Solutions',
        badge: 'RAG Grounding Active',
        chunks: [
          { name: 'Enterprise_AI_Whitepaper_2026.pdf', size: '2.4 MB', chunks: 42, status: 'Indexed' },
          { name: 'Brand_Voice_Guidelines_v3.md', size: '180 KB', chunks: 12, status: 'Indexed' },
        ],
        rules: [
          'Tone: Authoritative, Technical, Enterprise-grade',
          'Prohibited: "synergy", "game-changer", "magic bullet"',
          'Disclaimer: "For enterprise evaluation. Individual results may vary."',
        ],
      },
    },
    {
      id: 'campaigns',
      name: 'Campaign Wizard & Strategy',
      href: '/campaigns',
      icon: Megaphone,
      purpose: 'Multi-step campaign orchestrator generating audience summaries, campaign narratives, channel role assignments, and content pillar breakdowns.',
      features: [
        'Objective-driven campaign setup (Awareness, Lead Gen, Product Trial, Event)',
        'Multi-channel selection (LinkedIn, Facebook Pages, Instagram, Telegram)',
        'AI Strategy Narrative & Content Pillar matrix generator',
        'Oversight mode selector (Copilot, Approval Required, Risk-Based, Autonomous)',
      ],
      userActions: [
        'Define campaign objective and target audience persona',
        'Generate AI campaign narrative and approve strategic pillars',
        'Trigger multimodal content generation across all selected platforms',
      ],
      businessValue: 'Transforms raw marketing objectives into fully fleshed-out multi-channel strategies in under 60 seconds.',
      mockupData: {
        title: 'Campaign: Q3 AI in Healthcare Leadership',
        badge: 'Strategy Generated',
        pillars: [
          { name: 'Pillar 1: Agentic Orchestration', angle: 'Technical Architecture' },
          { name: 'Pillar 2: Clinical Data Privacy', angle: 'Compliance & Security' },
          { name: 'Pillar 3: ROI Case Studies', angle: 'Business Impact' },
        ],
        channels: ['LinkedIn (Primary)', 'Instagram (Visual)', 'Telegram (Broadcast)'],
      },
    },
    {
      id: 'approvals',
      name: 'Quality Review Council',
      href: '/approvals',
      icon: CheckCircle2,
      purpose: 'Deterministic gatekeeper evaluating every post for brand voice score, factual risk, compliance rating, legal disclaimers, and duplicate detection.',
      features: [
        'Multi-axis scoring breakdown (Brand Voice, Factual Risk, Compliance, Readability)',
        'Automatic prohibited term detection & missing disclaimer flags',
        'One-click Human-in-the-Loop approval, revision request, or edit workflow',
        'SLA timer tracking for pending reviews',
      ],
      userActions: [
        'Inspect AI review warnings and factual risk citations',
        'Edit post body or hashtags directly inside the review card',
        'Approve content for automated scheduling or request AI revision',
      ],
      businessValue: 'Protects enterprise reputation through deterministic legal and compliance gates before content reaches public channels.',
      mockupData: {
        title: 'Deterministic Review Council',
        badge: 'Decision Pending',
        scores: {
          brand: 96,
          factualRisk: 4,
          compliance: 100,
          originality: 98,
        },
        warnings: ['Validated mandatory disclaimer', 'Zero prohibited terms detected'],
      },
    },
    {
      id: 'calendar',
      name: 'Multi-Channel Calendar',
      href: '/calendar',
      icon: CalendarDays,
      purpose: 'Visual scheduling matrix offering collision prevention, timezone alignment, and automated publishing triggers across channels.',
      features: [
        'Month, week, and day grid views with channel color coding',
        'Drag-and-drop schedule adjustment with buffer constraint validation',
        'Channel collision warning system to prevent over-posting',
        'Instant "Publish Now" override trigger',
      ],
      userActions: [
        'View upcoming scheduled posts across LinkedIn, Meta, and Telegram',
        'Reschedule posts to optimal engagement windows',
        'Trigger instant publishing or cancel scheduled executions',
      ],
      businessValue: 'Ensures consistent multi-channel cadence without overlapping posts or burnout.',
      mockupData: {
        title: 'Schedule Matrix - August 2026',
        badge: '18 Events Queued',
        upcoming: [
          { time: 'Today 15:00 UTC', channel: 'LinkedIn', title: 'Multi-Agent ROI Framework' },
          { time: 'Tomorrow 09:30 UTC', channel: 'Instagram', title: 'Enterprise Visual Story' },
          { time: 'Fri 14:00 UTC', channel: 'Telegram', title: 'Q3 Product Intelligence Update' },
        ],
      },
    },
    {
      id: 'integrations',
      name: 'Social API Connectors',
      href: '/settings/integrations',
      icon: Settings,
      purpose: 'Secure OAuth credential manager supporting official LinkedIn REST API, Meta Graph API (Facebook Pages & Instagram Business), and Telegram Bot API.',
      features: [
        'AES-256-GCM encrypted token storage with hardware-level security',
        'Live OAuth credential testing & connection status health checks',
        'Sandbox simulation fallback mode when credentials are not configured',
        'Token expiry alerts & scope validation',
      ],
      userActions: [
        'Connect official LinkedIn OAuth 2.0 app credentials',
        'Configure Meta Page Access Tokens & Instagram Business IDs',
        'Test connection status and verify publishing permissions',
      ],
      businessValue: 'Provides enterprise-grade security for social media credentials with zero exposure of sensitive tokens.',
      mockupData: {
        title: 'Social API Connectors',
        badge: 'AES-256 Encrypted',
        connectors: [
          { platform: 'LinkedIn REST API', status: 'Connected (OAuth 2.0)', encrypted: true },
          { platform: 'Meta Graph API (IG/FB)', status: 'Connected (Pages Read/Write)', encrypted: true },
          { platform: 'Telegram Bot API', status: 'Connected (Bot Token)', encrypted: true },
        ],
      },
    },
    {
      id: 'analytics',
      name: 'Analytics & Strategic Recommendations',
      href: '/analytics',
      icon: BarChart3,
      purpose: 'Unified metrics engine providing normalized engagement data, 7-day metric simulations, pillar performance attribution, and next-best post suggestions.',
      features: [
        'Cross-platform normalized metrics (Impressions, Reach, Engagement Rate, CTR)',
        'Content Pillar performance matrix & format ROI ranking',
        '7-day simulated metric projector based on historical decay curves',
        'Next-best post AI recommendations powered by OptimizationAgent',
      ],
      userActions: [
        'Filter analytics by brand, date range, or social channel',
        'Apply AI recommendations to generate high-performing follow-up posts',
        'Export campaign performance data for executive reporting',
      ],
      businessValue: 'Drives continuous ROI optimization through causal learning and data-backed posting recommendations.',
      mockupData: {
        title: 'Normalized Performance & Recommendations',
        badge: 'Causal Learning Active',
        topPillar: 'Agentic Architecture (5.2% Engagement Rate)',
        recommendation: 'Target LinkedIn on Monday 14:00 UTC with "Technical Architecture" pillar for projected 32% reach boost.',
      },
    },
  ];

  const [activeScreenIndex, setActiveScreenIndex] = useState(0);
  const activeScreen = screens[activeScreenIndex];

  return (
    <section id="walkthrough" className="py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Application Walkthrough</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
          Inside the AICAS Enterprise Platform
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
          Explore the exact workspace pages and modules implemented in the codebase. Every tab represents a functional module built into the platform.
        </p>
      </div>

      {/* Perfectly Aligned Flex Wrap Screen Selector Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12 max-w-5xl mx-auto">
        {screens.map((screen, idx) => {
          const Icon = screen.icon;
          const isActive = idx === activeScreenIndex;
          return (
            <button
              key={screen.id}
              onClick={() => setActiveScreenIndex(idx)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 ring-1 ring-indigo-500 scale-[1.02]'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{screen.name}</span>
            </button>
          );
        })}
      </div>

      {/* Showcase Stage Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Side Details Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-indigo-950/20 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-mono">
                  Screen {activeScreenIndex + 1} of {screens.length}
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold">
                  {activeScreen.href}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{activeScreen.name}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">{activeScreen.purpose}</p>

              {/* Features Bullet List */}
              <div className="mb-6 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Key Features</h4>
                {activeScreen.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {/* Business Value Highlight */}
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-xs">
                <strong className="text-indigo-900 dark:text-indigo-300 block mb-1 font-semibold">Business Value:</strong>
                <p className="text-slate-700 dark:text-slate-300 leading-snug">{activeScreen.businessValue}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <Link
                  href={activeScreen.href}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 group"
                >
                  <span>Launch this page in App</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side UI Preview Mockup */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden h-full flex flex-col">
            {/* Browser Header Bar */}
            <div className="px-4 py-3 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
              </div>
              <div className="px-4 py-1 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[11px] font-mono border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">https://</span>aicas.enterprise{activeScreen.href}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Gemini 2.5 Active</div>
            </div>

            {/* Inner Mockup View */}
            <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-950/80 flex-1">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">{activeScreen.mockupData.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">AICAS Enterprise v2.5 • Operational</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {activeScreen.mockupData.badge}
                </span>
              </div>

              {/* Dynamic screen mockup body based on active screen */}
              {activeScreen.id === 'dashboard' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {activeScreen.mockupData.kpis?.map((k, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{k.label}</div>
                        <div className="text-base font-bold text-slate-900 dark:text-white mt-1">{k.val}</div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">{k.change}</div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center justify-between">
                      <span>Live Audit Event Stream</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">/activity</span>
                    </div>
                    <div className="space-y-2">
                      {activeScreen.mockupData.activity?.map((act, i) => (
                        <div key={i} className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 p-2 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                          <span className="truncate pr-2">{act.text}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono shrink-0">{act.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeScreen.id === 'brands' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="text-xs font-bold text-slate-900 dark:text-white mb-2">Ingested Vector Documents (RAG)</div>
                    <div className="space-y-2">
                      {activeScreen.mockupData.chunks?.map((c, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-slate-900 dark:text-white font-semibold">{c.name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                            <span>{c.size}</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{c.chunks} chunks</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-sans font-semibold">{c.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Brand Guardrails & Governance</div>
                    {activeScreen.mockupData.rules?.map((r, i) => (
                      <div key={i} className="text-xs text-slate-700 dark:text-slate-300 p-2 rounded bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 font-mono">
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeScreen.id === 'campaigns' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="text-xs font-bold text-slate-900 dark:text-white mb-2">Strategic Content Pillars</div>
                    <div className="space-y-2">
                      {activeScreen.mockupData.pillars?.map((p, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-900 dark:text-white">{p.name}</span>
                          <span className="text-indigo-600 dark:text-indigo-400 text-[11px] font-mono font-semibold">{p.angle}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeScreen.id === 'approvals' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Brand Voice</div>
                      <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">96/100</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Factual Risk</div>
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">4%</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Compliance</div>
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">100%</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Originality</div>
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-1">98%</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    ✓ Deterministic Quality Council passed. Content cleared for automated publishing.
                  </div>
                </div>
              )}

              {activeScreen.id === 'calendar' && (
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-white mb-2">Upcoming Schedule Queue</div>
                  {activeScreen.mockupData.upcoming?.map((u, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">{u.title}</span>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-semibold">{u.channel}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{u.time}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeScreen.id === 'integrations' && (
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-white mb-2">Connected OAuth Connectors</div>
                  {activeScreen.mockupData.connectors?.map((c, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900 dark:text-white">{c.platform}</span>
                      <span className="text-emerald-700 dark:text-emerald-400 text-[11px] font-mono font-semibold">{c.status}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeScreen.id === 'analytics' && (
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Top Content Pillar: {activeScreen.mockupData.topPillar}</div>
                  <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200">
                    <strong className="block mb-1 text-indigo-950 dark:text-indigo-300 font-bold">AI Recommendation:</strong>
                    {activeScreen.mockupData.recommendation}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

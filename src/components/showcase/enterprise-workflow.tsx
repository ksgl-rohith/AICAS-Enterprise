'use client';

import React, { useState } from 'react';
import {
  Megaphone,
  Search,
  Calendar,
  PenTool,
  ShieldCheck,
  CheckCircle,
  Clock,
  Send,
  BarChart3,
  Brain,
  Sparkles,
} from 'lucide-react';

export function EnterpriseWorkflowSection() {
  const workflowStages = [
    {
      id: 1,
      title: 'Campaign Creation',
      icon: Megaphone,
      purpose: 'Define strategic goals, target audience personas, multi-channel targets, and oversight mode.',
      exampleOutput: 'Campaign object instantiated with Objective: "Lead Generation", Audience: "Healthcare Executives", OversightMode: "APPROVAL_REQUIRED".',
    },
    {
      id: 2,
      title: 'Research & RAG Grounding',
      icon: Search,
      purpose: 'Fetch macro trend signals and retrieve vector embeddings from uploaded brand whitepaper documents.',
      exampleOutput: 'Retrieved 3 whitepaper vector chunks (Similarity: 0.94) + GDELT trend signal score 0.92.',
    },
    {
      id: 3,
      title: 'Strategic Planning',
      icon: Calendar,
      purpose: 'StrategyAgent defines core narrative pillars and PlannerAgent allocates format mix (text, image, carousel, video).',
      exampleOutput: 'Generated 3 Strategic Content Pillars (Agentic Architecture, Security/Compliance, ROI Case Studies).',
    },
    {
      id: 4,
      title: 'Multimodal Generation',
      icon: PenTool,
      purpose: 'CopywritingAgent crafts platform copy; VisualAgent builds image prompts, carousel slide decks, and video packages.',
      exampleOutput: 'LinkedIn post copy generated + 4-slide carousel deck specs + Instagram caption variant.',
    },
    {
      id: 5,
      title: 'Quality Council Review',
      icon: ShieldCheck,
      purpose: 'Deterministic scoring of brand voice alignment (0-100), factual risk score, compliance disclaimers, and duplicate similarity.',
      exampleOutput: 'ReviewResult: Brand Score 96/100, Factual Risk 4%, Compliance 100%, Prohibited Terms: 0.',
    },
    {
      id: 6,
      title: 'Human-in-the-Loop Approval',
      icon: CheckCircle,
      purpose: 'Assigned reviewer evaluates content in review queue with SLA timer tracking and optional inline editing.',
      exampleOutput: 'Approval Request #402 APPROVED by Administrator with zero edits requested.',
    },
    {
      id: 7,
      title: 'Timezone & Cadence Scheduling',
      icon: Clock,
      purpose: 'SchedulingAgent evaluates target audience timezone and validates channel collision constraints.',
      exampleOutput: 'Scheduled for Monday 14:00 UTC (LinkedIn) with zero buffer collisions.',
    },
    {
      id: 8,
      title: 'Idempotent Social API Publishing',
      icon: Send,
      purpose: 'PublishingAgent issues OAuth 2.0 network requests to LinkedIn REST API, Meta Graph API, or Telegram Bot API.',
      exampleOutput: 'HTTP 201 Created from LinkedIn REST API. External Post ID: `urn:li:share:71928401`',
    },
    {
      id: 9,
      title: 'Normalized Analytics Collection',
      icon: BarChart3,
      purpose: 'Ingests impression events, clicks, shares, and engagement rates into normalized metric tables.',
      exampleOutput: 'Normalized Metric Snapshot: 14,250 Impressions, 4.82% Engagement Rate, 320 Clicks.',
    },
    {
      id: 10,
      title: 'Causal Learning & Optimization',
      icon: Brain,
      purpose: 'OptimizationAgent derives causal insights, detects creative fatigue, and updates next-best post policies.',
      exampleOutput: 'Learned Memory Item: "Technical Architecture" pillar yields +38% higher CTR for CTO audiences.',
    },
  ];

  const [activeStageId, setActiveStageId] = useState(1);
  const activeStage = workflowStages.find((s) => s.id === activeStageId) || workflowStages[0];

  return (
    <section id="workflow" className="py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-4">
          <Brain className="w-3.5 h-3.5" />
          <span>Interactive Enterprise Lifecycle</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
          10-Stage Autonomous Execution Workflow
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
          From initial campaign wizard setup to causal learning, experience how every stage expands with purpose and concrete system outputs.
        </p>
      </div>

      {/* Stage Progress Bar / Timeline */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 mb-10">
        {workflowStages.map((stage) => {
          const Icon = stage.icon;
          const isActive = stage.id === activeStageId;
          return (
            <button
              key={stage.id}
              onClick={() => setActiveStageId(stage.id)}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 ring-1 ring-indigo-500'
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <div className="text-[10px] font-bold font-mono opacity-80 mb-1">0{stage.id}</div>
              <Icon className="w-5 h-5 mb-1.5" />
              <div className="text-[10px] font-bold line-clamp-1 leading-tight">{stage.title}</div>
            </button>
          );
        })}
      </div>

      {/* Stage Detail Card */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-indigo-950/20">
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md">
              0{activeStage.id}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{activeStage.title}</h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-semibold">Stage {activeStage.id} of 10</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            Active Workflow Stage
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 text-xs">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Stage Purpose</span>
            <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">{activeStage.purpose}</p>
          </div>

          <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Example System Output
            </span>
            <p className="text-slate-800 dark:text-slate-200 font-mono text-[11px] leading-relaxed p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/80 shadow-xs">
              {activeStage.exampleOutput}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

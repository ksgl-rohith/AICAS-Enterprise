import React from 'react';
import { agentRegistry } from '@/lib/ai/agent-registry';
import { Sparkles, Bot, ShieldCheck, Zap, Network, Scale, FileSearch, LineChart, Globe, Users, TrendingUp, DollarSign } from 'lucide-react';

export function ExpandedIntelligenceSection() {
  const registeredAgents = agentRegistry.listAgents();

  const capabilities = [
    {
      name: 'Website Brand Intelligence',
      role: 'Autonomous Web Scraping & Multi-Page Brand DNA Extraction',
      stage: 'Brand Ingestion',
      category: 'INTELLIGENCE',
      status: 'AVAILABLE',
      icon: Globe,
      description: 'Extracts company identity, offerings, target personas, and prohibited phrases directly from public website evidence with SSRF protection.',
    },
    {
      name: 'Deterministic Performance Forecasting',
      role: 'Channel Reach & Engagement Prediction',
      stage: 'Forecasting & Growth',
      category: 'INTELLIGENCE',
      status: 'AVAILABLE',
      icon: LineChart,
      description: 'Calculates expected reach, confidence bounds, lift percentages, data sufficiency ratings, and key performance factors before post publishing.',
    },
    {
      name: 'Trend Intelligence & Signal Mining',
      role: 'Market Signal Analysis & Freshness Scoring',
      stage: 'Opportunity Discovery',
      category: 'INTELLIGENCE',
      status: 'AVAILABLE',
      icon: Zap,
      description: 'Ingests live GDELT news and social listening signals to rank brand-relevant opportunities with real-time freshness state tracking.',
    },
    {
      name: 'Fact & Claim Verification',
      role: 'Grounding Audit & Evidence Attestation',
      stage: 'Trust & Governance',
      category: 'TRUST_GOVERNANCE',
      status: 'AVAILABLE',
      icon: ShieldCheck,
      description: 'Verifies every generated sentence against approved enterprise knowledge chunks, assigning explicit confidence scores and evidence excerpts.',
    },
    {
      name: 'Cost & LLM Model Tier Governance',
      role: 'Budget Limits & Optimal Tier Routing',
      stage: 'Cost Governance',
      category: 'TRUST_GOVERNANCE',
      status: 'AVAILABLE',
      icon: DollarSign,
      description: 'Enforces tenant token budgets, cost anomalies, and routes tasks to optimal LLM model tiers (Economy, Standard, Premium).',
    },
    {
      name: 'Multi-Platform Governed Publisher',
      role: 'OAuth Connector Management & Idempotency',
      stage: 'Execution & Publishing',
      category: 'EXECUTION_LEARNING',
      status: 'AVAILABLE',
      icon: Network,
      description: 'Manages encrypted API credentials and social platform capabilities for LinkedIn, Meta, Instagram, Telegram, and CMS export channels with real/sandbox switching.',
    },
  ];

  return (
    <section className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>What's New in AICAS Intelligence</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Expanded Multi-Agent Operating System
        </h2>
        <p className="max-w-2xl mx-auto text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          AICAS Enterprise integrates {registeredAgents.length} specialized AI agents working synchronously across brand ingestion, market research, dynamic generation, forecasting, and quality review.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {capabilities.map((cap) => {
          const Icon = cap.icon;
          return (
            <div
              key={cap.name}
              className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {cap.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {cap.name}
              </h3>
              <div className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 mb-3">
                {cap.stage} • {cap.role}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {cap.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

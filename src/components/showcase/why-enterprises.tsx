'use client';

import React from 'react';
import { ShieldCheck, Lock, Zap, UserCheck, Scale, Eye, Bot } from 'lucide-react';

export function WhyEnterprisesSection() {
  const cards = [
    {
      title: 'Controlled Governance',
      icon: ShieldCheck,
      desc: 'Flexibly configure oversight modes per campaign: Copilot, Approval Required, Risk-Based Autonomy, or Fully Autonomous execution.',
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
      badge: '4 Autonomy Modes',
    },
    {
      title: 'Hardware-Level Security',
      icon: Lock,
      desc: 'All social API credentials encrypted using AES-256-GCM token encryption. Strict multi-tenant isolation prevents cross-organization data leakage.',
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
      badge: 'AES-256 Encrypted',
    },
    {
      title: 'Multi-Agent Automation',
      icon: Zap,
      desc: 'End-to-end orchestration coordinates 10 specialized domain agents to generate campaigns, format media, and publish without bottlenecks.',
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
      badge: '10 Domain Agents',
    },
    {
      title: 'Human-in-the-Loop Review',
      icon: UserCheck,
      desc: 'Deterministic Quality Review Council scores every post for brand voice, factual risk, and compliance before triggering approval queues.',
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
      badge: 'SLA Review Timer',
    },
    {
      title: 'Idempotent Scalability',
      icon: Scale,
      desc: 'Vector knowledge RAG chunking guarantees zero hallucinations. Unique idempotency keys prevent duplicate social network postings.',
      color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800',
      badge: 'Zero Duplication',
    },
    {
      title: 'Complete Observability',
      icon: Eye,
      desc: 'Immutable audit event ledger records every agent action, prompt version, score breakdown, and publishing response header.',
      color: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/60 border-pink-200 dark:border-pink-800',
      badge: '100% Audit Lineage',
    },
    {
      title: 'Domain Intelligence',
      icon: Bot,
      desc: 'Domain-specific agents work in tandem rather than relying on brittle, monolithic single prompts.',
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
      badge: 'Specialized LLM Architecture',
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Enterprise Requirements</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
          Why Enterprises Standardize on AICAS
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
          Designed specifically for global enterprises requiring strict legal compliance, security isolation, and complete audit visibility.
        </p>
      </div>

      {/* Enterprise Cards Centered Flex Wrapper */}
      <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all shadow-sm hover:shadow-md space-y-4 group w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-sm flex-grow-0 shrink-0"
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${card.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {card.badge}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{card.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{card.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

'use client';

import React from 'react';
import { ShieldCheck, Lock, Zap, UserCheck, Scale, Eye, Bot } from 'lucide-react';

export function WhyEnterprisesSection() {
  const cards = [
    {
      title: 'Controlled Governance',
      icon: ShieldCheck,
      desc: 'Flexibly configure oversight modes per campaign: Copilot, Approval Required, Risk-Based Autonomy, or Fully Autonomous execution.',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      badge: '4 Autonomy Modes',
    },
    {
      title: 'Hardware-Level Security',
      icon: Lock,
      desc: 'All social API credentials encrypted using AES-256-GCM token encryption. Strict multi-tenant isolation prevents cross-organization data leakage.',
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      badge: 'AES-256 Encrypted',
    },
    {
      title: 'Multi-Agent Automation',
      icon: Zap,
      desc: 'End-to-end orchestration coordinates 10 specialized domain agents to generate campaigns, format media, and publish without bottlenecks.',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      badge: '10 Domain Agents',
    },
    {
      title: 'Human-in-the-Loop Review',
      icon: UserCheck,
      desc: 'Deterministic Quality Review Council scores every post for brand voice, factual risk, and compliance before triggering approval queues.',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      badge: 'SLA Review Timer',
    },
    {
      title: 'Idempotent Scalability',
      icon: Scale,
      desc: 'Vector knowledge RAG chunking guarantees zero hallucinations. Unique idempotency keys prevent duplicate social network postings.',
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
      badge: 'Zero Duplication',
    },
    {
      title: 'Complete Observability',
      icon: Eye,
      desc: 'Immutable audit event ledger records every agent action, prompt version, score breakdown, and publishing response header.',
      color: 'text-pink-600 bg-pink-50 border-pink-200',
      badge: '100% Audit Lineage',
    },
    {
      title: 'Domain Intelligence',
      icon: Bot,
      desc: 'Domain-specific agents work in tandem rather than relying on brittle, monolithic single prompts.',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      badge: 'Specialized LLM Architecture',
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Enterprise Requirements</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
          Why Enterprises Standardize on AICAS
        </h2>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
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
              className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-indigo-400 transition-all shadow-sm hover:shadow-md space-y-4 group w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-sm flex-grow-0 shrink-0"
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${card.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {card.badge}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">{card.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{card.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

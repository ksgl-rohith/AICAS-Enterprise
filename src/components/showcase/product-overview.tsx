'use client';

import React from 'react';
import {
  Building2,
  Cpu,
  ShieldCheck,
  Share2,
  BarChart3,
  Sparkles,
  Layers,
  Clock,
  Zap,
} from 'lucide-react';

export function ProductOverviewSection() {
  return (
    <section id="overview" className="py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/80 rounded-3xl my-6 transition-colors duration-200">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-4">
          <Layers className="w-3.5 h-3.5" />
          <span>Product Overview</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
          The Autonomous Social Content Operating System
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
          AICAS Enterprise replaces fragmented social tools with a unified multi-agent operating system. It ingests grounded brand DNA, crafts platform-native multimodal copy, enforces strict compliance scoring, schedules intelligently, and learns continuously from post performance.
        </p>
      </div>

      {/* Interactive Animated Workflow Diagram */}
      <div className="mb-20 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-indigo-950/20 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              End-to-End Autonomous Data & Intelligence Pipeline
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              From Grounded RAG Knowledge Ingestion to Idempotent API Publishing
            </p>
          </div>
          <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-semibold border border-emerald-200 dark:border-emerald-800">
            ● System Status: Operational
          </span>
        </div>

        {/* Workflow Map Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {/* Node 1 */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-white dark:hover:bg-slate-800/80 transition-all group shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">1. Brand Intelligence</div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              Tone guidelines, prohibited terms, required disclaimers, and PDF whitepaper vector chunking.
            </p>
            <div className="mt-3 text-[10px] font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded border border-indigo-100 dark:border-indigo-800 font-semibold">
              Route: /brands
            </div>
          </div>

          {/* Node 2 */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-white dark:hover:bg-slate-800/80 transition-all group shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-700 dark:text-purple-400 mb-4 group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">2. AI Strategy & Copy</div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              Multi-agent narrative strategy, content pillars, channel roles, carousel slides, & video storyboards.
            </p>
            <div className="mt-3 text-[10px] font-mono text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-1 rounded border border-purple-100 dark:border-purple-800 font-semibold">
              Route: /campaigns
            </div>
          </div>

          {/* Node 3 */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-white dark:hover:bg-slate-800/80 transition-all group shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-400 mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">3. Quality Council</div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              Deterministic checks for brand voice, compliance score (0-100), factual risk & disclaimers.
            </p>
            <div className="mt-3 text-[10px] font-mono text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-1 rounded border border-amber-100 dark:border-amber-800 font-semibold">
              Route: /approvals
            </div>
          </div>

          {/* Node 4 */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-slate-800/80 transition-all group shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
              <Share2 className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">4. Social Connectors</div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              AES-256 token encryption for LinkedIn REST API, Meta Graph API & Telegram Bot API.
            </p>
            <div className="mt-3 text-[10px] font-mono text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-1 rounded border border-blue-100 dark:border-blue-800 font-semibold">
              Route: /settings
            </div>
          </div>

          {/* Node 5 */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-white dark:hover:bg-slate-800/80 transition-all group shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">5. Causal Learning</div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              Normalized metrics, engagement simulations, fatigue detection, and next-best post suggestions.
            </p>
            <div className="mt-3 text-[10px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded border border-emerald-100 dark:border-emerald-800 font-semibold">
              Route: /analytics
            </div>
          </div>
        </div>
      </div>

      {/* 3 Core Value Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all shadow-sm hover:shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Multi-Agent Intelligence</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Rather than a single LLM prompt, AICAS deploys 10 domain-specific agents—from Trend & Strategy to Copywriting, Visuals, and Compliance.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500 transition-all shadow-sm hover:shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/80 border border-purple-100 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Deterministic Governance</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            No unvetted AI copy hits production. Every piece of content is scored by the Quality Review Council for brand voice score, factual accuracy, legal disclaimers, and duplicate risk.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all shadow-sm hover:shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Idempotent Publishing & RAG</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Ground copy using enterprise PDF knowledge bases. Connect live API OAuth credentials for LinkedIn, Meta, and Telegram with retry ledgers to prevent duplicate publishing.
          </p>
        </div>
      </div>
    </section>
  );
}

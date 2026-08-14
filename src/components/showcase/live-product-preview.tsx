'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Megaphone,
  CheckCircle2,
  BarChart3,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

import { useAuth } from '@/components/auth-context';

export function LiveProductPreviewSection() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'wizard' | 'council' | 'analytics'>('dashboard');

  return (
    <section className="py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/80 rounded-3xl my-6 transition-colors duration-200">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Live Product Preview</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
          Experience AICAS Enterprise Live Right Now
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
          Interact directly with live mockups representing real application UI states before entering the full workspace.
        </p>
      </div>

      {/* Interactive Mockup Container */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-indigo-950/20 overflow-hidden backdrop-blur-2xl">
        {/* Browser Top Navigation Bar */}
        <div className="px-6 py-4 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white pl-2">AICAS Enterprise Workspace</span>
          </div>

          {/* Tab Switcher Pills */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold shadow-xs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('wizard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'wizard'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Campaign Wizard</span>
            </button>

            <button
              onClick={() => setActiveTab('council')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'council'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Quality Council</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
          </div>

          <Link
            href={user ? '/dashboard' : '/login'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <span>{user ? 'Open Studio' : 'Enter App'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Live Mockup Interactive Canvas */}
        <div className="p-8 bg-slate-50 dark:bg-slate-950/80 min-h-[380px] space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">Executive Command Overview</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Active Workspace: ApexAI Solutions</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-semibold border border-emerald-200 dark:border-emerald-800">
                  Engine: Gemini 2.5 Flash
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Reach</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">142,850</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">+24.5% this month</div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg Engagement</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">4.82%</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">+1.2% benchmark</div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Brand Voice Score</div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">96/100</div>
                  <div className="text-[10px] text-indigo-700 dark:text-indigo-300 font-semibold mt-1">Optimal Alignment</div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Scheduled Posts</div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">18 Queued</div>
                  <div className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold mt-1">Collision Free</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
                <div className="font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
                  <span>System Activity Stream</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-semibold">Real-time Event Ledger</span>
                </div>
                <div className="space-y-2 text-slate-700 dark:text-slate-300">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span>StrategyAgent finalized narrative for "Q3 Enterprise AI Launch"</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Just now</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span>ReviewAgent approved LinkedIn post (Score 98/100, Factual Risk 4%)</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">15m ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wizard' && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">Multi-Step Campaign Wizard</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Step 2: AI Strategy Narrative & Pillar Generation</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-mono font-semibold border border-purple-200 dark:border-purple-800">
                  Mode: Approval Required
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">Generated Content Pillars</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white block mb-1">Pillar 1: Agentic Architecture</strong>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Angle: Technical CTO positioning</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white block mb-1">Pillar 2: Compliance & RAG</strong>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Angle: Grounded legal risk mitigation</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white block mb-1">Pillar 3: Enterprise ROI</strong>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Angle: 80% content velocity increase</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'council' && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">Quality Review Council Gate</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Deterministic scoring of generated copy candidate</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-semibold border border-emerald-200 dark:border-emerald-800">
                  Review Passed
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Brand Voice</span>
                    <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">96/100</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Factual Risk</span>
                    <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">4%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Compliance</span>
                    <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">100%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Prohibited</span>
                    <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">0 Found</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold">
                  ✓ Deterministic Quality Council cleared content. Zero legal risk flags detected.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-in fade-in duration-200 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">Normalized Growth & Recommendations</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Causal Memory Engine Active</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-semibold border border-indigo-200 dark:border-indigo-800">
                  7-Day Simulator
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="font-bold text-slate-900 dark:text-white">Next-Best Post AI Recommendation</div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
                  "Target LinkedIn on Monday 14:00 UTC with 'Technical Architecture' pillar. Projected 32% increase in CTR based on past 30-day causal curve."
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

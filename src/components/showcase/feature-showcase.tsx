'use client';

import React, { useState } from 'react';
import {
  Megaphone,
  Sparkles,
  FileText,
  ShieldCheck,
  Check,
  ThumbsUp,
  Share2,
  Bookmark,
  Cpu,
} from 'lucide-react';

export function FeatureShowcaseSection() {
  const [activeTab, setActiveTab] = useState<'campaign' | 'content' | 'rag' | 'quality'>('campaign');

  return (
    <section id="features" className="py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/80 rounded-3xl my-6 transition-colors duration-200">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-4">
          <Cpu className="w-3.5 h-3.5" />
          <span>Core Feature Showcase</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
          Real Inputs. Realistic Outputs. Grounded Results.
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
          See how inputs provided by marketing leaders are transformed into fully structured campaign assets, verified by deterministic compliance engines.
        </p>
      </div>

      {/* Feature Selector Tabs */}
      <div className="flex items-center justify-center gap-2 mb-12 flex-wrap">
        <button
          onClick={() => setActiveTab('campaign')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'campaign'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 ring-1 ring-indigo-500'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>1. Campaign Creation</span>
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'content'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 ring-1 ring-indigo-500'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>2. AI Content Generation</span>
        </button>

        <button
          onClick={() => setActiveTab('rag')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'rag'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 ring-1 ring-indigo-500'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>3. Grounded Knowledge RAG</span>
        </button>

        <button
          onClick={() => setActiveTab('quality')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'quality'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 ring-1 ring-indigo-500'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>4. Quality Review Council</span>
        </button>
      </div>

      {/* Main Showcase Panel */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-indigo-950/20">
        {/* Tab 1: Campaign Creation */}
        {activeTab === 'campaign' && (
          <div className="space-y-8">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Megaphone className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  Campaign Creation Wizard
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Input campaign objectives and audience targets to automatically construct multi-channel strategy and post schedules.
                </p>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-semibold border border-emerald-200 dark:border-emerald-800 self-start md:self-auto">
                Business Value: 90% Faster Campaign Launch
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sample Input Panel */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Sample Input</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-semibold">POST /api/campaigns</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Campaign Name:</span>
                    <strong className="text-slate-900 dark:text-white font-semibold">AI in Healthcare</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Objective:</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">Lead Generation</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Target Audience:</span>
                    <strong className="text-slate-900 dark:text-white font-semibold">Healthcare Executives & CMOs</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Target Platform:</span>
                    <strong className="text-purple-600 dark:text-purple-400 font-semibold">LinkedIn & Instagram</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Schedule Cadence:</span>
                    <strong className="text-slate-900 dark:text-white font-semibold">Every Monday 14:00 UTC</strong>
                  </div>
                </div>
              </div>

              {/* Generated Output Panel */}
              <div className="p-6 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Generated Output
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-semibold">
                    Status: Campaign Successfully Created
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                    <div className="flex justify-between text-slate-700 dark:text-slate-300">
                      <span>Status:</span>
                      <strong className="text-emerald-700 dark:text-emerald-400 font-bold">SCHEDULED</strong>
                    </div>
                    <div className="flex justify-between text-slate-700 dark:text-slate-300">
                      <span>Platforms:</span>
                      <strong className="text-indigo-700 dark:text-indigo-400 font-bold">LinkedIn, Instagram</strong>
                    </div>
                    <div className="flex justify-between text-slate-700 dark:text-slate-300">
                      <span>Estimated Campaign Reach:</span>
                      <strong className="text-slate-900 dark:text-white font-bold">25,000+ Healthcare Leaders</strong>
                    </div>
                    <div className="flex justify-between text-slate-700 dark:text-slate-300">
                      <span>Generated Posts:</span>
                      <strong className="text-slate-900 dark:text-white font-bold">3 LinkedIn Copies, 2 Visual Briefs</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-300 text-xs">
                    ✓ StrategyAgent successfully mapped 3 content pillars tailored for Enterprise Healthcare Executives.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Content Generation */}
        {activeTab === 'content' && (
          <div className="space-y-8">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  Multimodal AI Copy Studio
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Generates platform-tailored copy with persuasive hooks, bullet points, call to actions, and brand scoring.
                </p>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-semibold border border-emerald-200 dark:border-emerald-800 self-start md:self-auto">
                Business Value: High-Engagement Copy in Seconds
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Sample Input (4 cols) */}
              <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">Sample Input</span>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Topic</span>
                  <strong className="text-slate-900 dark:text-white text-xs">Benefits of Multi-Agent AI</strong>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Tone</span>
                  <strong className="text-indigo-600 dark:text-indigo-400 text-xs">Professional & Technical</strong>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Target Audience</span>
                  <strong className="text-purple-600 dark:text-purple-400 text-xs">Enterprise CTOs & VPs of Engineering</strong>
                </div>
              </div>

              {/* Premium LinkedIn Post Preview Card (8 cols) */}
              <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
                {/* LinkedIn Card Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                      AP
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">ApexAI Solutions</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">14,200 followers • Promoted</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      Brand Score: 98/100
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      2 min read
                    </span>
                  </div>
                </div>

                {/* Generated LinkedIn Post Body */}
                <div className="text-xs text-slate-800 dark:text-slate-200 space-y-3 leading-relaxed font-sans">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    🚀 Single LLM prompts don't scale in enterprise production. Multi-agent orchestration is the real shift.
                  </p>
                  <p>
                    When scaling social content operations across regulated global markets, relying on single generic prompts inevitably leads to brand voice drift and compliance risks.
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Here is how multi-agent architecture transforms content velocity:
                  </p>
                  <ul className="space-y-1.5 list-disc pl-4 text-slate-700 dark:text-slate-300">
                    <li><strong>Brand Context Agent:</strong> Enforces tone guardrails and ingests whitepapers via RAG.</li>
                    <li><strong>Copywriting Agent:</strong> Crafts platform-native hooks, bullet points, and calls to action.</li>
                    <li><strong>Deterministic Review Council:</strong> Checks legal disclaimers and factual risk score prior to publishing.</li>
                  </ul>
                  <p className="text-indigo-600 dark:text-indigo-400 font-semibold pt-1">
                    👉 Read the full Enterprise AI Architecture whitepaper: https://apexai.solutions/whitepaper
                  </p>
                  <p className="text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">
                    #EnterpriseAI #MultiAgent #ArtificialIntelligence #SoftwareArchitecture #CTO
                  </p>
                </div>

                {/* Simulated LinkedIn Engagement Bar */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer font-medium">
                      <ThumbsUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> 142
                    </span>
                    <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer font-medium">28 Comments</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Share2 className="w-3.5 h-3.5 hover:text-slate-900 dark:hover:text-white cursor-pointer" />
                    <Bookmark className="w-3.5 h-3.5 hover:text-slate-900 dark:hover:text-white cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: RAG Knowledge Ingestion */}
        {activeTab === 'rag' && (
          <div className="space-y-8">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  Grounded Knowledge Ingestion & RAG
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Upload PDF whitepapers or Markdown documents to create vector embeddings and cite sources in every post.
                </p>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-semibold border border-emerald-200 dark:border-emerald-800 self-start md:self-auto">
                Business Value: Zero Factual Hallucinations
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* RAG Input */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Uploaded Brand Document</span>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <strong className="text-slate-900 dark:text-white text-xs block">Enterprise_AI_Whitepaper_2026.pdf</strong>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">PDF • 2.4 MB • 42 Vector Chunks</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold text-[10px] border border-emerald-200 dark:border-emerald-800">
                    Indexed
                  </span>
                </div>
              </div>

              {/* RAG Output */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">Retrieved Vector Evidence</span>
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                  "Chunk #14: Enterprise multi-agent systems reduce content revision cycles from 4.2 days down to 18 minutes while guaranteeing legal disclaimer adherence."
                </div>
                <div className="text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold">
                  ✓ Verified ground truth source reference: <code>Doc #402, Chunk #14 (Similarity: 0.94)</code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Quality Review Council */}
        {activeTab === 'quality' && (
          <div className="space-y-8">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  Deterministic Quality Review Council
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Evaluates posts across brand voice alignment, factual risk score, legal compliance, and prohibited phrases.
                </p>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-semibold border border-emerald-200 dark:border-emerald-800 self-start md:self-auto">
                Business Value: Guaranteed Compliance
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Brand Voice Score</div>
                <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">96 / 100</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Optimal Tone</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Factual Risk Score</div>
                <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">4%</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Low Risk</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Compliance Rating</div>
                <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">100%</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Disclaimer Verified</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Prohibited Terms</div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">0</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">Clean Vocabulary</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

'use client';

import React, { useState } from 'react';
import { Cpu, Database, Network, ShieldCheck, Share2, BarChart3, Layers, Zap, ArrowDown, Lock, Server } from 'lucide-react';

export function TechArchitectureSection() {
  const [activeLayer, setActiveLayer] = useState<number | null>(null);

  const architectureLayers = [
    {
      id: 1,
      title: 'Layer 1: Client & Ingress Gateway',
      icon: Network,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Edge Ingress',
      tech: 'Next.js 14 Server Actions • App Router • Middleware Auth',
      components: [
        { name: 'Showcase & Admin Workspace', detail: 'React 18 SSR / Dynamic Client Shell' },
        { name: 'OAuth 2.0 Session Guard', detail: 'JWT Tokens & Role-Based Access Control' },
        { name: 'Edge Rate Limiter', detail: 'Tenant Throttle & Request Inspection' },
      ],
    },
    {
      id: 2,
      title: 'Layer 2: Autonomous Multi-Agent Orchestrator',
      icon: Layers,
      color: 'from-indigo-600 to-purple-600',
      badge: '24 Specialized Agents',
      tech: 'OrchestratorAgent • Workflow State Machine • Crisis Pause Engine',
      components: [
        { name: 'Strategy & Planning Pipeline', detail: 'StrategyAgent • ContentPlanningAgent • SeoDiscoveryAgent' },
        { name: 'Multimodal Creative Studio', detail: 'CopywritingAgent • CarouselAgent • VideoAgent • ImageAgent' },
        { name: 'Quality Council Gate', detail: 'FactVerificationAgent • ComplianceAgent • BrandCriticAgent' },
      ],
    },
    {
      id: 3,
      title: 'Layer 3: AI Model Gateway & Vector RAG Engine',
      icon: Cpu,
      color: 'from-purple-600 to-pink-600',
      badge: 'RAG & AI Inference',
      tech: 'Google Gemini 2.5 Flash • Vector Cosine Similarity Index',
      components: [
        { name: 'Model Gateway', detail: 'Gemini SDK Integration with Mock Fallback Engine' },
        { name: 'Grounded RAG Retriever', detail: 'PDF/Markdown Chunking & Vector Citation Engine' },
        { name: 'Deterministic Evaluator', detail: 'Zod JSON Schema Validation & Retry Guard' },
      ],
    },
    {
      id: 4,
      title: 'Layer 4: Persistence & Security Governance',
      icon: Database,
      color: 'from-emerald-600 to-teal-600',
      badge: 'AES-256 Vault',
      tech: 'Prisma ORM • AES-256-GCM Credential Vault • Audit Ledger',
      components: [
        { name: 'Enterprise DB Storage', detail: 'PostgreSQL / SQLite Database with Prisma Engine' },
        { name: 'AES-256 Token Vault', detail: 'Hardware-Level Encrypted Social OAuth Tokens' },
        { name: 'Immutable Audit Stream', detail: 'AuditEvent Ledger & Policy Lineage Tracker' },
      ],
    },
    {
      id: 5,
      title: 'Layer 5: Idempotent Social API Connectors',
      icon: Share2,
      color: 'from-teal-600 to-cyan-600',
      badge: 'Live Social APIs',
      tech: 'LinkedIn REST API • Meta Graph API • Telegram Bot API',
      components: [
        { name: 'LinkedIn REST Connector', detail: 'OAuth 2.0 UGC Posts API (`/v2/ugcPosts`)' },
        { name: 'Meta Graph API Connector', detail: 'Facebook Pages & Instagram Business Media API' },
        { name: 'Telegram Bot Connector', detail: 'Encrypted Telegram Bot Channel Broadcast API' },
      ],
    },
  ];

  return (
    <section id="architecture" className="py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-50 border-y border-slate-200/60 rounded-3xl my-6">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
          <Network className="w-3.5 h-3.5" />
          <span>Enterprise Technology Stack</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
          System Architecture Diagram
        </h2>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          High-performance 5-layer system architecture connecting client ingress, 24 multi-agent pipelines, RAG vector retrieval, AES-256 encryption, and live social network APIs.
        </p>
      </div>

      {/* Professional Visual Architecture Diagram Stack */}
      <div className="space-y-4 max-w-5xl mx-auto mb-12">
        {architectureLayers.map((layer, idx) => {
          const Icon = layer.icon;
          const isHighlighted = activeLayer === layer.id;
          return (
            <React.Fragment key={layer.id}>
              {/* Architecture Layer Box */}
              <div
                onMouseEnter={() => setActiveLayer(layer.id)}
                onMouseLeave={() => setActiveLayer(null)}
                className={`p-6 rounded-3xl bg-white border transition-all duration-300 shadow-md ${
                  isHighlighted
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-xl scale-[1.01]'
                    : 'border-slate-200 hover:border-indigo-400'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${layer.color} flex items-center justify-center text-white shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{layer.title}</h3>
                      <p className="text-xs font-mono text-indigo-600 font-bold mt-0.5">{layer.tech}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200 self-start sm:self-auto">
                    {layer.badge}
                  </span>
                </div>

                {/* Sub-Components Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {layer.components.map((comp, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                        {comp.name}
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono leading-tight">{comp.detail}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connecting Flow Arrow between layers */}
              {idx < architectureLayers.length - 1 && (
                <div className="flex items-center justify-center py-1">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-mono font-bold">
                    <ArrowDown className="w-3.5 h-3.5 animate-bounce text-indigo-600" />
                    <span>Synchronous Data Flow & Idempotency Check</span>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Animated Connector Footer Bar */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-700 max-w-5xl mx-auto">
        <span className="flex items-center gap-2 font-bold">
          <Zap className="w-4 h-4 text-indigo-600 animate-pulse" />
          System Latency: 184ms • Idempotency Enabled • Zero Token Exposure
        </span>
        <span className="text-slate-500 font-semibold">AICAS Enterprise v2.5 Architecture</span>
      </div>
    </section>
  );
}

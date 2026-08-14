'use client';

import React, { useState } from 'react';
import { agentRegistry } from '@/lib/ai/agent-registry';
import {
  Building2,
  TrendingUp,
  Target,
  CalendarDays,
  PenTool,
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
  Layers,
  LineChart,
  Users,
  Eye,
  AlertTriangle,
  Scale,
  Zap,
} from 'lucide-react';

const iconMap: Record<string, any> = {
  BrandContextAgent: Building2,
  WebsiteBrandIntelligenceAgent: Globe,
  IngestionAgent: FileText,
  MarketResearchAgent: Search,
  TrendIntelligenceAgent: Zap,
  ForecastingAgent: LineChart,
  StrategyAgent: Target,
  ContentPlanningAgent: CalendarDays,
  CopywritingAgent: PenTool,
  ImageAgent: ImageIcon,
  CarouselAgent: Layers,
  InfographicAgent: PieChart,
  StaticVisualAgent: ImageIcon,
  VideoAgent: Video,
  FactVerificationAgent: CheckCircle,
  ComplianceAgent: ShieldCheck,
  BrandCriticAgent: ShieldCheck,
  AccessibilityAgent: Eye,
  SeoDiscoveryAgent: Search,
  ReviewAgent: Scale,
  CostGovernanceAgent: DollarSign,
  IncidentAgent: AlertTriangle,
  SchedulingAgent: Clock,
  PublishingAgent: Send,
  AnalyticsAgent: BarChart3,
  OptimizationAgent: TrendingUp,
  ExperimentAgent: FlaskConical,
  CommunityAgent: MessageSquare,
  LocalizationAgent: Globe,
  OrchestratorAgent: Bot,
  Default: Bot,
};

const categoryColors: Record<string, string> = {
  INTELLIGENCE: 'from-indigo-500 to-blue-600',
  STRATEGY_CREATION: 'from-pink-500 to-rose-600',
  TRUST_GOVERNANCE: 'from-emerald-500 to-teal-600',
  EXECUTION_LEARNING: 'from-purple-500 to-indigo-600',
};

export function AgentShowcaseSection() {
  const registeredAgents = agentRegistry.listAgents();
  const [selectedAgentName, setSelectedAgentName] = useState<string>('BrandContextAgent');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const filteredAgents = activeCategory === 'ALL'
    ? registeredAgents
    : registeredAgents.filter((a) => a.category === activeCategory);

  const selectedAgent = registeredAgents.find((a) => a.name === selectedAgentName) || registeredAgents[0];
  const IconComponent = iconMap[selectedAgent.name] || iconMap.Default;
  const gradientColor = categoryColors[selectedAgent.category || 'INTELLIGENCE'] || 'from-indigo-500 to-blue-600';

  return (
    <section id="agents" className="py-16 sm:py-20 relative overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl my-6">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 text-xs font-semibold mb-4">
          <Bot className="w-3.5 h-3.5" />
          <span>Multi-Agent System Ecosystem</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          {registeredAgents.length} Implemented AI Agents. Governed Autonomy.
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          Inspect the exact responsibilities, input parameters, generated outputs, and execution specifications of all active agents in the AICAS Enterprise codebase.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {[
          { id: 'ALL', label: `All Agents (${registeredAgents.length})` },
          { id: 'INTELLIGENCE', label: 'Intelligence' },
          { id: 'STRATEGY_CREATION', label: 'Strategy & Creation' },
          { id: 'TRUST_GOVERNANCE', label: 'Trust & Governance' },
          { id: 'EXECUTION_LEARNING', label: 'Execution & Learning' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Agent Grid System */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-10">
        {filteredAgents.map((agent) => {
          const Icon = iconMap[agent.name] || iconMap.Default;
          const isSelected = agent.name === selectedAgentName;
          const cardGradient = categoryColors[agent.category || 'INTELLIGENCE'] || 'from-indigo-500 to-blue-600';

          return (
            <button
              key={agent.name}
              onClick={() => setSelectedAgentName(agent.name)}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group min-h-[110px] ${
                isSelected
                  ? 'bg-white dark:bg-slate-800 border-indigo-600 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/30 scale-[1.02]'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              <div>
                <div
                  className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${cardGradient} flex items-center justify-center text-white mb-2 shadow-xs group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{agent.name}</div>
                <div className="text-[9px] text-indigo-600 dark:text-indigo-400 font-mono font-semibold truncate mt-0.5">
                  {agent.name}
                </div>
              </div>
              <div className="mt-2 text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 w-max border border-slate-200 dark:border-slate-700">
                {agent.tag || agent.category}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Agent Inspector Drawer / Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${gradientColor} flex items-center justify-center text-white shadow-md shrink-0`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{selectedAgent.name}</h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-semibold mt-0.5">
                Version: {selectedAgent.version} • Mode: {selectedAgent.executionMode} • Category: {selectedAgent.category || 'INTELLIGENCE'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-semibold border border-emerald-200 dark:border-emerald-800">
              Status: {selectedAgent.status || 'AVAILABLE'}
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-semibold border border-indigo-200 dark:border-indigo-800">
              Role: {selectedAgent.tag || selectedAgent.category}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-xs">
          {/* Column 1: Responsibilities & Inputs */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Responsibilities</span>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{selectedAgent.responsibilities || selectedAgent.description}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Inputs</span>
              <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed">{selectedAgent.inputs || 'Brand parameters, task specs'}</p>
            </div>
          </div>

          {/* Column 2: Outputs */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 h-full flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-2">Generated Outputs</span>
                <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed">{selectedAgent.outputs || 'Structured JSON output matching agent schema'}</p>
              </div>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
                All outputs pass through Quality Council validation before persistence.
              </div>
            </div>
          </div>

          {/* Column 3: Execution Specification */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-2 h-full">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                Execution Specification / Output Sample
              </span>
              <p className="text-slate-800 dark:text-slate-200 font-mono text-[11px] leading-relaxed p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/80 shadow-xs">
                {selectedAgent.exampleResult || 'Executed with status COMPLETED and zero policy warnings.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

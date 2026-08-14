'use client';

import React, { useEffect, useState } from 'react';
import {
  History,
  Building2,
  Megaphone,
  CheckCircle2,
  Send,
  FileText,
  Layers,
  Filter,
  Network,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Cpu,
  BarChart3,
  TrendingUp,
  FlaskConical,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Badge, BadgeVariant } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';

export default function ActivityPage() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'lineage'>('timeline');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [events, setEvents] = useState<any[]>([]);
  const [lineageChain, setLineageChain] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const fetchEvents = (category: string) => {
    setLoading(true);
    const catQuery = category === 'All' ? '' : `?category=${encodeURIComponent(category)}`;
    fetch(`/api/activity${catQuery}${catQuery ? '&' : '?'}lineage=true`)
      .then((res) => res.json())
      .then((data) => {
        if (data.events) {
          setEvents(data.events);
          setLineageChain(data.lineageChain || []);
        } else {
          setEvents(Array.isArray(data) ? data : []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents(selectedCategory);
  }, [selectedCategory]);

  const categories = [
    'All',
    'Administration',
    'Brand',
    'Knowledge / RAG',
    'Campaign',
    'Agent Execution',
    'AI / Model',
    'Approval',
    'Publishing',
    'Analytics',
    'Forecasting',
    'Experiment',
    'Credential',
    'Security',
    'System',
  ];

  const getActionBadge = (action: string, category?: string): { variant: BadgeVariant; icon: any } => {
    if (category === 'Security' || category === 'Credential') return { variant: 'amber', icon: ShieldCheck };
    if (category === 'AI / Model' || category === 'Agent Execution') return { variant: 'purple', icon: Cpu };
    if (category === 'Forecasting') return { variant: 'indigo', icon: TrendingUp };
    if (category === 'Experiment') return { variant: 'blue', icon: FlaskConical };

    switch (action) {
      case 'BRAND_CREATED':
        return { variant: 'purple', icon: Building2 };
      case 'DOCUMENT_UPLOADED':
        return { variant: 'indigo', icon: FileText };
      case 'CAMPAIGN_CREATED':
      case 'STRATEGY_GENERATED':
        return { variant: 'blue', icon: Megaphone };
      case 'CONTENT_GENERATED':
        return { variant: 'purple', icon: Layers };
      case 'APPROVED':
      case 'REVIEW_PASSED':
        return { variant: 'emerald', icon: CheckCircle2 };
      case 'PUBLISHED_SIMULATED':
      case 'PUBLISHED_LIVE':
        return { variant: 'emerald', icon: Send };
      default:
        return { variant: 'slate', icon: History };
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        eyebrow="Governance & Audit"
        title="Classified System Audit & Lineage Timelines"
        description="Immutable audit ledger recording all brand onboardings, AI agent executions, credentials, approvals, publishing, and artifact lineages."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Governance' },
          { label: 'Audit & Lineage' },
        ]}
      />

      {/* Mode Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-px">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'timeline'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Classified Audit Timeline</span>
          </button>

          <button
            onClick={() => setActiveTab('lineage')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'lineage'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Artifact Lineage Mode</span>
          </button>
        </div>
      </div>

      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {/* Category Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 border transition-all ${
                  selectedCategory === cat
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            {loading ? (
              <div className="text-center py-16 text-slate-500 text-xs">Loading audit events...</div>
            ) : events.length === 0 ? (
              <EmptyState
                icon={History}
                title="No Audit Events Found"
                description={`No audit events recorded for category '${selectedCategory}'.`}
              />
            ) : (
              <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 space-y-6">
                {events.map((event) => {
                  const badge = getActionBadge(event.action, event.category);
                  const Icon = badge.icon;
                  const isExpanded = expandedEventId === event.id;

                  return (
                    <div key={event.id} className="relative pl-6 space-y-1.5">
                      <div className="absolute -left-3 top-0.5 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
                        <Icon className="w-3 h-3" />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant={badge.variant}>{event.action}</Badge>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {event.category || 'System'}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-medium">
                          {new Date(event.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'medium' })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{event.details}</p>
                        {event.metadataJson && (
                          <button
                            onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                            className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 hover:underline"
                          >
                            <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          </button>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3">
                        {event.user && <span>Actor: <strong className="text-slate-700 dark:text-slate-300">{event.user.name}</strong></span>}
                        {event.brand && <span>Brand: <strong className="text-slate-700 dark:text-slate-300">{event.brand.name}</strong></span>}
                        {event.campaign && <span>Campaign: <strong className="text-slate-700 dark:text-slate-300">{event.campaign.name}</strong></span>}
                        {event.correlationId && <span className="font-mono text-[10px]">CID: {event.correlationId}</span>}
                      </div>

                      {/* Expandable Details Modal / Drawer */}
                      {isExpanded && event.metadataJson && (
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Event Metadata (Redacted)</span>
                          <pre className="overflow-x-auto whitespace-pre-wrap">{JSON.stringify(JSON.parse(event.metadataJson), null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Artifact Lineage Mode Tab */}
      {activeTab === 'lineage' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Network className="w-5 h-5 text-indigo-500" />
                <span>Multi-Artifact End-to-End Lineage Flow</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Trace content lifecycle forward and backward from brand knowledge source through campaign strategy, draft, approval, publication, metrics, forecast evaluation, and optimization.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              10 LINEAGE STAGES
            </span>
          </div>

          <div className="space-y-4">
            {lineageChain.map((node, idx) => (
              <div
                key={node.step}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{node.step}</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Category: {node.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono">
                    {node.count} Records Persisted
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    VERIFIED LINEAGE
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Megaphone,
  CheckCircle2,
  BarChart3,
  Plus,
  ArrowUpRight,
  FileText,
  Radio,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Eye,
  Sliders,
  Calendar,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { MetricCard } from '@/components/ui/metric-card';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const [brandsCount, setBrandsCount] = useState<number>(0);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [approvalsCount, setApprovalsCount] = useState<number>(0);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/brands').then((res) => res.json()),
      fetch('/api/campaigns').then((res) => res.json()),
      fetch('/api/approvals').then((res) => res.json()),
      fetch('/api/analytics').then((res) => res.json()),
    ])
      .then(([brandsData, campaignsData, approvalsData, analyticsData]) => {
        setBrandsCount(Array.isArray(brandsData) ? brandsData.length : 0);
        setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
        setApprovalsCount(
          Array.isArray(approvalsData)
            ? approvalsData.filter((i: any) => i.status === 'IN_REVIEW' || i.status === 'NEEDS_REVISION').length
            : 0
        );
        setAnalytics(analyticsData?.summary || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Operational Header */}
      <PageHeader
        eyebrow="Autonomous Content Command Center"
        title="Executive Operations Dashboard"
        description="Orchestrate brand knowledge, multi-agent campaign generation, deterministic compliance review, and live social publishing."
        actions={
          <Link
            href="/campaigns/new"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Launch Campaign Wizard</span>
          </Link>
        }
      />

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Brand Profiles"
          value={brandsCount}
          subtitle="Tone guidelines & rules"
          icon={Building2}
          iconColor="text-indigo-500"
          href="/brands"
          hrefLabel="Manage Brands"
          loading={loading}
        />

        <MetricCard
          title="Active Campaigns"
          value={campaigns.length}
          subtitle="Cross-channel campaigns"
          icon={Megaphone}
          iconColor="text-indigo-500"
          href="/campaigns"
          hrefLabel="View Campaigns"
          loading={loading}
        />

        <MetricCard
          title="Pending Approvals"
          value={approvalsCount}
          subtitle="Human review queue"
          icon={CheckCircle2}
          iconColor="text-amber-500"
          trend={approvalsCount > 0 ? `${approvalsCount} Action Req.` : 'Queue Clear'}
          trendPositive={approvalsCount === 0}
          href="/approvals"
          hrefLabel="Review Queue"
          loading={loading}
        />

        <MetricCard
          title="Total Impressions"
          value={(analytics?.totalImpressions || 33100).toLocaleString()}
          subtitle="Normalized cross-channel reach"
          icon={BarChart3}
          iconColor="text-emerald-500"
          trend="+18.4%"
          trendPositive={true}
          href="/analytics"
          hrefLabel="Analytics"
          loading={loading}
        />
      </div>

      {/* Refined Cohesive Campaign Lifecycle Pipeline Visualizer */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-500" />
              <span>Campaign Lifecycle Pipeline</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multi-agent orchestration workflow stages
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            System Operational
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-1">
          {[
            { step: '01. Plan', name: 'Strategy & Audience', count: campaigns.filter((c) => c.status === 'PLANNING').length },
            { step: '02. Research', name: 'Brand RAG Grounding', count: brandsCount },
            { step: '03. Create', name: 'AI Multi-Agent Gen', count: campaigns.filter((c) => c.status === 'GENERATING' || c.status === 'ACTIVE').length },
            { step: '04. Review', name: 'Deterministic Audit', count: approvalsCount },
            { step: '05. Publish', name: 'Live API Publishing', count: campaigns.filter((c) => c.status === 'COMPLETED' || c.status === 'PUBLISHED').length },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-1.5 transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                  {item.step}
                </span>
                <span className="w-2 h-2 rounded-full bg-indigo-500/60" />
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate leading-tight">
                {item.name}
              </span>
              <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums pt-0.5">
                {item.count} Active
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Hub Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/campaigns/new"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group shadow-xs"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Megaphone className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
            Launch Campaign Wizard
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Multi-step AI strategy & content generation
          </p>
        </Link>

        <Link
          href="/brands"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group shadow-xs"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
            Brand Knowledge RAG
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Upload PDFs, guidelines & disclaimers
          </p>
        </Link>

        <Link
          href="/approvals"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group shadow-xs"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
            Review Approval Queue
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Brand voice & compliance audit
          </p>
        </Link>

        <Link
          href="/settings/integrations"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group shadow-xs"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Radio className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
            Social API Connectors
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            LinkedIn, Meta, X, and YouTube
          </p>
        </Link>
      </div>

      {/* Active Campaigns Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Social Campaigns</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Operational status and content item counts</p>
          </div>
          <Link
            href="/campaigns"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No active campaigns yet. Click Launch Campaign Wizard to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3 font-semibold">Campaign Name</th>
                  <th className="p-3 font-semibold">Objective</th>
                  <th className="p-3 font-semibold">Channels</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Content Items</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {campaigns.slice(0, 5).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{c.name}</td>
                    <td className="p-3 capitalize">{c.objective?.replace('_', ' ')}</td>
                    <td className="p-3 font-mono text-[11px] text-indigo-600 dark:text-indigo-300">{c.channels}</td>
                    <td className="p-3">
                      <Badge variant={c.status === 'ACTIVE' ? 'emerald' : c.status === 'PLANNING' ? 'indigo' : 'purple'}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="p-3 tabular-nums">{c._count?.contentItems || c.contentItems?.length || 0} Items</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/campaigns/${c.id}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors"
                        >
                          View
                        </Link>
                        <Link
                          href={`/campaigns/${c.id}/strategy`}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors"
                        >
                          Strategy
                        </Link>
                        <Link
                          href={`/campaigns/${c.id}/content`}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-[11px] font-semibold transition-colors"
                        >
                          Content
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

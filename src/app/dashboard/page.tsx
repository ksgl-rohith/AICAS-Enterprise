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
  Clock,
  Sparkles,
  ChevronRight,
  Bot,
  ShieldAlert,
} from 'lucide-react';

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
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/20 p-6 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Autonomous Operations
            </span>
            <span className="text-xs text-slate-300">Multi-Agent Engine Active</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Executive Content Dashboard</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Orchestrate brand knowledge, campaign planning, AI generation, deterministic compliance review, and live social publishing.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/campaigns/new"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign Wizard</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Active Brand Profiles</span>
            <Building2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{loading ? '...' : brandsCount}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Configured tone & disclaimers</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Active Campaigns</span>
            <Megaphone className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{loading ? '...' : campaigns.length}</div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Cross-channel campaigns</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Pending Approvals</span>
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{loading ? '...' : approvalsCount}</div>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Review Queue</span>
          </div>
          <Link href="/approvals" className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1">
            Review Queue <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Total Impressions</span>
            <BarChart3 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {loading ? '...' : (analytics?.totalImpressions || 33100).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Normalized performance analytics</p>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          href="/campaigns/new"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all group shadow-md"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Megaphone className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-500">Launch Campaign Wizard</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Multi-step strategy & generation</p>
        </Link>

        <Link
          href="/brands"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 transition-all group shadow-md"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-500">Brand Knowledge RAG</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Upload PDFs, Word docs & rules</p>
        </Link>

        <Link
          href="/approvals"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-all group shadow-md"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-500">Review Approval Queue</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Brand score & compliance review</p>
        </Link>

        <Link
          href="/settings/integrations"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all group shadow-md"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Radio className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-500">Social API Connectors</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">LinkedIn, Facebook, Instagram, X APIs</p>
        </Link>
      </div>

      {/* Recent Campaigns Overview Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Social Campaigns</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Lifecycle status and content item counts</p>
          </div>
          <Link href="/campaigns" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">No active campaigns yet. Click New Campaign Wizard to create one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Campaign Name</th>
                  <th className="p-3">Objective</th>
                  <th className="p-3">Channels</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Content Items</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {campaigns.slice(0, 5).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{c.name}</td>
                    <td className="p-3 capitalize">{c.objective.replace('_', ' ')}</td>
                    <td className="p-3 font-mono text-[11px] text-indigo-600 dark:text-indigo-300">{c.channels}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3">{c._count?.contentItems || c.contentItems?.length || 0} Items</td>
                    <td className="p-3 text-right space-x-2">
                      <Link href={`/campaigns/${c.id}`} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                        View
                      </Link>
                      <Link href={`/campaigns/${c.id}/strategy`} className="text-purple-600 dark:text-purple-400 font-medium hover:underline">
                        Strategy
                      </Link>
                      <Link href={`/campaigns/${c.id}/content`} className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                        Content
                      </Link>
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

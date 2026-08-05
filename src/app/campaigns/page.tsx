'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Megaphone, Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/campaigns')
      .then((res) => res.json())
      .then((data) => {
        setCampaigns(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Campaign Operations"
        title="Active Campaigns & Strategies"
        description="Multi-agent social media campaigns with grounded AI strategy, multi-channel copy variants, and publishing pipeline."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Campaign Operations' },
          { label: 'Campaign Wizard' },
        ]}
        actions={
          <Link
            href="/campaigns/new"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign Wizard</span>
          </Link>
        }
      />

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-xs">Loading campaigns...</div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No Campaigns Created Yet"
          description="Launch the Multi-step Campaign Wizard to build AI-driven multi-channel social campaigns."
          action={
            <Link
              href="/campaigns/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-sm shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" /> Launch Campaign Wizard
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">{c.name}</h2>
                  <Badge variant={c.status === 'ACTIVE' ? 'emerald' : c.status === 'PLANNING' ? 'indigo' : 'purple'}>
                    {c.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{c.description || c.productOrTopic}</p>
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Objective: <strong className="text-slate-800 dark:text-slate-200 capitalize">{c.objective?.replace('_', ' ')}</strong></span>
                  <span>Channels: <strong className="text-indigo-600 dark:text-indigo-400 uppercase font-mono">{c.channels}</strong></span>
                  <span>Items: <strong className="text-purple-600 dark:text-purple-400 tabular-nums">{c._count?.contentItems || 0} Posts</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/campaigns/${c.id}/strategy-preview`}
                  className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 font-semibold text-xs border border-purple-200 dark:border-purple-800/60 transition-colors"
                >
                  Strategy Preview
                </Link>
                <Link
                  href={`/campaigns/${c.id}/content`}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm shadow-indigo-600/20 transition-all"
                >
                  Content Studio
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Megaphone, Plus, Sparkles, ChevronRight, Layers } from 'lucide-react';

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Campaign Operations</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Multi-agent social media campaigns with grounded AI strategy, multi-channel copy variants, and publishing pipeline.
          </p>
        </div>
        <Link
          href="/campaigns/new"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Campaign Wizard</span>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs">Loading campaigns...</div>
      ) : campaigns.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <Megaphone className="w-12 h-12 text-purple-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Campaigns Created Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Launch the Multi-step Campaign Wizard to build AI-driven multi-channel social campaigns.
          </p>
          <Link
            href="/campaigns/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" /> Launch Campaign Wizard
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">{c.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{c.description || c.productOrTopic}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>Objective: <strong className="text-slate-800 dark:text-slate-200 capitalize">{c.objective.replace('_', ' ')}</strong></span>
                  <span>Channels: <strong className="text-indigo-600 dark:text-indigo-400 uppercase">{c.channels}</strong></span>
                  <span>Items: <strong className="text-purple-600 dark:text-purple-400">{c._count?.contentItems || 0} Posts</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/campaigns/${c.id}/strategy-preview`}
                  className="px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-semibold text-xs border border-purple-500/20 transition-all"
                >
                  Strategy Preview
                </Link>
                <Link
                  href={`/campaigns/${c.id}/content`}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all"
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

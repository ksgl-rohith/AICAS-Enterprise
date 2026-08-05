'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Megaphone, Sparkles, Layers, CheckCircle2, ChevronRight, CalendarDays, Radio } from 'lucide-react';

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/campaigns/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCampaign(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading || !campaign) {
    return <div className="text-center py-12 text-slate-500 text-xs">Loading campaign details...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/campaigns" className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">{campaign.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {campaign.status}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Brand: <strong className="text-white">{campaign.brand?.name}</strong> • Objective: <strong className="capitalize text-slate-200">{campaign.objective.replace('_', ' ')}</strong>
          </p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href={`/campaigns/${campaign.id}/strategy`}
          className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/30 to-indigo-900/20 border border-purple-500/30 hover:border-purple-500/60 transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>AI Strategy Workspace</span>
            </div>
            <p className="text-xs text-slate-300">
              {campaign.strategy ? 'Strategy generated with content pillars & channel roles.' : 'Click to generate campaign strategy.'}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href={`/campaigns/${campaign.id}/content`}
          className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900/30 to-slate-900 border border-indigo-500/30 hover:border-indigo-500/60 transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
              <Layers className="w-4 h-4" />
              <span>Multi-Agent Content Studio</span>
            </div>
            <p className="text-xs text-slate-300">
              {campaign.contentItems?.length || 0} Content Items generated with multi-channel variants.
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Content Items Breakdown */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white">Generated Content Items ({campaign.contentItems?.length || 0})</h2>

        {(!campaign.contentItems || campaign.contentItems.length === 0) ? (
          <div className="text-center py-8 text-slate-500 text-xs space-y-2">
            <p>No content items generated yet for this campaign.</p>
            <Link
              href={`/campaigns/${campaign.id}/strategy`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold text-xs"
            >
              <Sparkles className="w-4 h-4" /> Generate Strategy & Content
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {campaign.contentItems.map((item: any) => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white">{item.title}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      {item.format}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Pillar: {item.contentPillar}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {item.status}
                  </span>
                  <Link href={`/campaigns/${campaign.id}/content`} className="text-indigo-400 hover:underline">
                    Edit Variants
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Layers,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Database,
  Calendar,
  Zap,
} from 'lucide-react';

export default function CampaignStrategyPreviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingContent, setGeneratingContent] = useState(false);

  const fetchCampaign = () => {
    fetch(`/api/campaigns/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCampaign(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCampaign();
  }, [params.id]);

  const handleApproveAndGenerate = async () => {
    setGeneratingContent(true);
    try {
      const res = await fetch(`/api/campaigns/${params.id}/generate-content`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        router.push(`/campaigns/${params.id}/content`);
      } else {
        alert(data.error || 'Failed to generate content items.');
        setGeneratingContent(false);
      }
    } catch {
      alert('Error generating content.');
      setGeneratingContent(false);
    }
  };

  if (loading || !campaign) {
    return <div className="text-center py-12 text-slate-500 text-xs">Loading Strategy Preview...</div>;
  }

  const strategy = campaign.strategy;
  const pillars = strategy ? JSON.parse(strategy.contentPillarsJson || '[]') : [];
  const channelRoles = strategy ? JSON.parse(strategy.channelRolesJson || '{}') : {};
  const contentIdeas = strategy ? JSON.parse(strategy.contentIdeasJson || '[]') : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/campaigns/${campaign.id}`} className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Campaign Strategy Plan Preview</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                Strategy Preview
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Review the complete strategy blueprint before generating content items.</p>
          </div>
        </div>

        {/* Primary Action: Approve & Execute Multi-Agent Content Generation */}
        <button
          onClick={handleApproveAndGenerate}
          disabled={generatingContent || !strategy}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>{generatingContent ? 'Generating Multimodal Copy & Visuals...' : 'Approve Strategy & Generate Content'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {!strategy ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <Sparkles className="w-12 h-12 text-purple-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Strategy Generation Pending</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Click below to run StrategyAgent and assemble grounded content pillars for this campaign.
          </p>
          <button
            onClick={() => router.push(`/campaigns/${campaign.id}/strategy`)}
            className="px-6 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Run Strategy Agent Workspace
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Executive Overview & Narrative */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-slate-900 border border-purple-500/30 space-y-4 shadow-xl text-white">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 block mb-1">
                Campaign Master Narrative
              </span>
              <h2 className="text-lg md:text-xl font-black leading-snug">{strategy.campaignNarrative}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Objective Interpretation</span>
                <p className="text-slate-200">{strategy.objectiveInterpretation}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Target Audience Summary</span>
                <p className="text-slate-200">{strategy.audienceSummary}</p>
              </div>
            </div>
          </div>

          {/* Content Pillars Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" /> Strategic Content Pillars ({pillars.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pillars.map((pillar: any, idx: number) => (
                <div key={idx} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                      P{idx + 1}
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{pillar.name}</h4>
                  </div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-300 font-semibold pt-1">
                    <strong>Angle:</strong> {pillar.angle}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                    <strong>Rationale:</strong> {pillar.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Channel Roles Breakdown */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Social Channel Roles & Content Mix</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {Object.entries(channelRoles).map(([channel, role]) => (
                <div key={channel} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider block">
                    {channel}
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{role as string}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Proposed Content Topics */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Proposed Content Draft Topics ({contentIdeas.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {contentIdeas.map((idea: string, idx: number) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-semibold">{idea}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

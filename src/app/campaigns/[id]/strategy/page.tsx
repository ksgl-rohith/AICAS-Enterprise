'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Layers, RefreshCw, CheckCircle2, ArrowRight, ShieldCheck, Database } from 'lucide-react';

export default function CampaignStrategyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [rebuildingStrategy, setRebuildingStrategy] = useState(false);

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

  const handleGenerateStrategy = async () => {
    setRebuildingStrategy(true);
    try {
      const res = await fetch(`/api/campaigns/${params.id}/generate-strategy`, { method: 'POST' });
      if (res.ok) {
        fetchCampaign();
      } else {
        alert('Failed to generate strategy');
      }
    } catch {
      alert('Strategy generation error.');
    } finally {
      setRebuildingStrategy(false);
    }
  };

  const handleGenerateContent = async () => {
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
      alert('Content generation error.');
      setGeneratingContent(false);
    }
  };

  if (loading || !campaign) {
    return <div className="text-center py-12 text-slate-500 text-xs">Loading campaign strategy...</div>;
  }

  const strategy = campaign.strategy;
  const pillars = strategy ? JSON.parse(strategy.contentPillarsJson || '[]') : [];
  const channelRoles = strategy ? JSON.parse(strategy.channelRolesJson || '{}') : {};
  const contentIdeas = strategy ? JSON.parse(strategy.contentIdeasJson || '[]') : [];
  const evidence = strategy ? JSON.parse(strategy.retrievedEvidenceJson || '[]') : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/campaigns/${campaign.id}`} className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">AI Strategy Workspace</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                StrategyAgent
              </span>
            </div>
            <p className="text-xs text-slate-400">Campaign: {campaign.name} • Brand: {campaign.brand?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateStrategy}
            disabled={rebuildingStrategy}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${rebuildingStrategy ? 'animate-spin' : ''}`} />
            <span>Re-Run Strategy Agent</span>
          </button>
          <button
            onClick={handleGenerateContent}
            disabled={generatingContent || !strategy}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            <span>{generatingContent ? 'Generating Multimodal Copy...' : 'Generate Multimodal Content'}</span>
          </button>
        </div>
      </div>

      {!strategy ? (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Strategy Generated Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click below to execute StrategyAgent and assemble grounded content pillars for this campaign.
          </p>
          <button
            onClick={handleGenerateStrategy}
            disabled={rebuildingStrategy}
            className="px-6 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Execute Strategy Agent
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Executive Overview & Narrative */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/20 via-slate-900 to-slate-900 border border-purple-500/30 space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 block mb-1">
                Campaign Master Narrative
              </span>
              <h2 className="text-lg font-bold text-white">{strategy.campaignNarrative}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Objective Interpretation</span>
                <p className="text-slate-200">{strategy.objectiveInterpretation}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Audience Summary</span>
                <p className="text-slate-200">{strategy.audienceSummary}</p>
              </div>
            </div>
          </div>

          {/* Content Pillars Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" /> Strategic Content Pillars ({pillars.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pillars.map((pillar: any, idx: number) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      P{idx + 1}
                    </div>
                    <h4 className="font-bold text-white text-xs">{pillar.name}</h4>
                  </div>
                  <div className="text-xs text-indigo-300 font-medium pt-1">
                    <strong>Angle:</strong> {pillar.angle}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                    <strong>Rationale:</strong> {pillar.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Channel Roles Breakdown */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Social Channel Roles & Content Mix</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {Object.entries(channelRoles).map(([channel, role]) => (
                <div key={channel} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">
                    {channel}
                  </span>
                  <p className="text-slate-300 leading-relaxed">{role as string}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Content Ideas & Grounded Evidence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white">Proposed Content Topics ({contentIdeas.length})</h3>
              <ul className="space-y-2 text-xs">
                {contentIdeas.map((idea: string, idx: number) => (
                  <li key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span>{idea}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" /> Grounded RAG Evidence Cited
              </h3>
              {evidence.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">No explicit RAG citations required for general strategy setup.</p>
              ) : (
                <div className="space-y-2 text-xs">
                  {evidence.map((ev: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-indigo-400 font-semibold block">{ev.filename || 'Brand Knowledge Document'}</span>
                      <p className="text-slate-300 font-mono text-[11px]">"{ev.sourceText || ev.excerpt}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

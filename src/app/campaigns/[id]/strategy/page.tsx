'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Layers,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Database,
  Edit3,
  Save,
  UserCheck,
} from 'lucide-react';

export default function CampaignStrategyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [rebuildingStrategy, setRebuildingStrategy] = useState(false);

  // Human Rewrite State
  const [editingNarrative, setEditingNarrative] = useState(false);
  const [savingNarrative, setSavingNarrative] = useState(false);
  const [humanNarrative, setHumanNarrative] = useState('');
  const [humanObjectiveText, setHumanObjectiveText] = useState('');
  const [humanAudienceText, setHumanAudienceText] = useState('');

  const fetchCampaign = () => {
    fetch(`/api/campaigns/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCampaign(data);
        if (data.strategy) {
          setHumanNarrative(data.strategy.campaignNarrative || '');
          setHumanObjectiveText(data.strategy.objectiveInterpretation || '');
          setHumanAudienceText(data.strategy.audienceSummary || '');
        }
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

  const handleSaveHumanStrategyEdit = async () => {
    if (!campaign.strategy) return;
    setSavingNarrative(true);
    try {
      const res = await fetch(`/api/campaigns/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy: {
            ...campaign.strategy,
            campaignNarrative: humanNarrative,
            objectiveInterpretation: humanObjectiveText,
            audienceSummary: humanAudienceText,
          },
        }),
      });

      if (res.ok) {
        setEditingNarrative(false);
        fetchCampaign();
      } else {
        alert('Failed to save human edits.');
      }
    } catch {
      alert('Network error saving strategy edit.');
    } finally {
      setSavingNarrative(false);
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 text-xs gap-2">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading Campaign Strategy...</span>
      </div>
    );
  }

  const strategy = campaign.strategy;
  const pillars = strategy ? JSON.parse(strategy.contentPillarsJson || '[]') : [];
  const channelRoles = strategy ? JSON.parse(strategy.channelRolesJson || '{}') : {};
  const contentIdeas = strategy ? JSON.parse(strategy.contentIdeasJson || '[]') : [];
  const evidence = strategy ? JSON.parse(strategy.retrievedEvidenceJson || '[]') : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/campaigns/${campaign.id}`} className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Strategy Workspace</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                StrategyAgent
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Campaign: {campaign.name} • Brand: {campaign.brand?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateStrategy}
            disabled={rebuildingStrategy}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${rebuildingStrategy ? 'animate-spin' : ''}`} />
            <span>Re-Run Strategy Agent</span>
          </button>

          <button
            onClick={handleGenerateContent}
            disabled={generatingContent || !strategy}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Layers className="w-4 h-4" />
            <span>{generatingContent ? 'Generating Multimodal Copy...' : 'Generate Multimodal Content'}</span>
          </button>
        </div>
      </div>

      {!strategy ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-xs">
          <Sparkles className="w-12 h-12 text-purple-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Strategy Generated Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Click below to execute StrategyAgent and assemble grounded content pillars for this campaign.
          </p>
          <button
            onClick={handleGenerateStrategy}
            disabled={rebuildingStrategy}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4" /> Execute Strategy Agent
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* AI Suggestion Header & Narrative Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400 block mb-1">
                  AI Campaign Master Narrative (AI Suggestion)
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Review AI suggestions below. Click "Human Rewrite Mode" to edit narrative, audience alignment, or objective interpretations.
                </p>
              </div>

              <div>
                {!editingNarrative ? (
                  <button
                    type="button"
                    onClick={() => setEditingNarrative(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Human Rewrite Mode</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingNarrative(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveHumanStrategyEdit}
                      disabled={savingNarrative}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingNarrative ? 'Saving...' : 'Save Overrides'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {!editingNarrative ? (
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                "{strategy.campaignNarrative}"
              </h2>
            ) : (
              <textarea
                rows={3}
                value={humanNarrative}
                onChange={(e) => setHumanNarrative(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-indigo-500 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Objective Interpretation</span>
                {!editingNarrative ? (
                  <p className="text-slate-900 dark:text-slate-100 font-medium">{strategy.objectiveInterpretation}</p>
                ) : (
                  <textarea
                    rows={2}
                    value={humanObjectiveText}
                    onChange={(e) => setHumanObjectiveText(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-500 text-xs text-slate-900 dark:text-white font-medium"
                  />
                )}
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Audience Summary</span>
                {!editingNarrative ? (
                  <p className="text-slate-900 dark:text-slate-100 font-medium">{strategy.audienceSummary}</p>
                ) : (
                  <textarea
                    rows={2}
                    value={humanAudienceText}
                    onChange={(e) => setHumanAudienceText(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-500 text-xs text-slate-900 dark:text-white font-medium"
                  />
                )}
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
                <div key={idx} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                      P{idx + 1}
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{pillar.name}</h4>
                  </div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-300 font-semibold pt-1">
                    <strong>Angle:</strong> {pillar.angle}
                  </div>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed pt-1 font-normal">
                    <strong>Rationale:</strong> {pillar.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Channel Roles Breakdown */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Social Channel Roles & Content Mix
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {Object.entries(channelRoles).map(([channel, role]) => (
                <div key={channel} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider block">
                    {channel}
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">{role as string}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Content Ideas & Grounded Evidence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Proposed Content Topics ({contentIdeas.length})
              </h3>
              <ul className="space-y-2 text-xs">
                {contentIdeas.map((idea: string, idx: number) => (
                  <li key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 flex items-center gap-2 font-medium">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span>{idea}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-500" /> Grounded RAG Evidence Cited
              </h3>
              {evidence.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">No explicit RAG citations required for general strategy setup.</p>
              ) : (
                <div className="space-y-2 text-xs">
                  {evidence.map((ev: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold block">{ev.filename || 'Brand Knowledge Document'}</span>
                      <p className="text-slate-800 dark:text-slate-200 font-mono text-[11px]">"{ev.sourceText || ev.excerpt}"</p>
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

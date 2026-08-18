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
  RefreshCw,
  History,
  X,
  Bot,
  Zap,
  TrendingUp,
  Search,
  Building2,
  Calendar,
  Check,
  Sliders,
  AlertCircle,
  FileText,
} from 'lucide-react';

const FEEDBACK_CATEGORIES = [
  'Audience Focus',
  'Objective Realignment',
  'Messaging & Value Prop',
  'Tone & Voice Adjustments',
  'Content Pillars',
  'Channel Prioritization',
  'Call-to-Action (CTA)',
  'Competitor Counter-Positioning',
  'Trend / News Focus',
  'Product / Feature Highlight',
  'Compliance & Disclaimers',
  'Other',
];

export default function CampaignStrategyPreviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [refreshModalOpen, setRefreshModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Refresh feedback state
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectiveAgents, setSelectiveAgents] = useState({
    marketResearch: true,
    trendIntelligence: true,
    forecasting: true,
    brandContext: false,
  });

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

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleRefreshStrategy = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/campaigns/${params.id}/refresh-strategy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: feedbackText,
          feedbackCategories: selectedCategories,
          selectiveRefresh: selectiveAgents,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setRefreshModalOpen(false);
        setFeedbackText('');
        setSelectedCategories([]);
        fetchCampaign();
      } else {
        alert(data.error || 'Failed to refresh intelligence.');
      }
    } catch {
      alert('Error connecting to Strategy Refresh API.');
    } finally {
      setRefreshing(false);
    }
  };

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

  let sourceFreshnessParsed: any = { sources: [], revisionSummary: null, history: [] };
  if (strategy?.sourceFreshnessJson) {
    try {
      const raw = JSON.parse(strategy.sourceFreshnessJson);
      if (Array.isArray(raw)) {
        sourceFreshnessParsed.sources = raw;
      } else if (typeof raw === 'object' && raw !== null) {
        sourceFreshnessParsed = raw;
      }
    } catch {
      // fallback
    }
  }

  const revisionSummary = sourceFreshnessParsed.revisionSummary;
  const version = strategy?.version || 1;

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
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                v{version} Blueprint
              </span>
              {version > 1 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Refined via Intelligence
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Review multi-agent strategy pillars or refine with feedback before content generation.</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {strategy && (
            <button
              onClick={() => setRefreshModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs shadow-xs flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Refresh Intelligence</span>
            </button>
          )}

          <button
            onClick={handleApproveAndGenerate}
            disabled={generatingContent || !strategy}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all shrink-0 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{generatingContent ? 'Generating Multimodal Copy & Visuals...' : 'Approve Strategy & Generate Content'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Revision Change Summary Banner (if v2+) */}
      {revisionSummary && (
        <div className="p-5 rounded-3xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/70 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Revision Change Summary (v{version})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
              Refreshed: {new Date(revisionSummary.refreshedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {revisionSummary.appliedFeedback && (
            <div className="text-xs text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
              <strong className="text-indigo-700 dark:text-indigo-300">Incorporated Feedback:</strong> "{revisionSummary.appliedFeedback}"
            </div>
          )}

          {revisionSummary.keyChanges && revisionSummary.keyChanges.length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Structured Modifications:</span>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                {revisionSummary.keyChanges.map((change: string, idx: number) => (
                  <li key={idx}>{change}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

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
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-white dark:from-purple-950/30 dark:via-indigo-950/30 dark:to-slate-900 border border-indigo-100 dark:border-purple-500/30 space-y-4 shadow-lg text-slate-900 dark:text-white transition-all">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 dark:text-purple-400 block mb-1">
                Campaign Master Narrative
              </span>
              <h2 className="text-lg md:text-xl font-black leading-snug text-slate-900 dark:text-white">{strategy.campaignNarrative}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-950/80 border border-indigo-100/80 dark:border-slate-800 space-y-1 shadow-xs">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase block">Objective Interpretation</span>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{strategy.objectiveInterpretation}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-950/80 border border-indigo-100/80 dark:border-slate-800 space-y-1 shadow-xs">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase block">Target Audience Summary</span>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{strategy.audienceSummary}</p>
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

      {/* Refresh Intelligence Modal Drawer */}
      {refreshModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Feedback-Driven Intelligence Refresh
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Evolving from <strong className="text-indigo-600 dark:text-indigo-400">v{version}</strong> to <strong className="text-indigo-600 dark:text-indigo-400">v{version + 1}</strong> with multi-agent realignment.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRefreshModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Select Feedback Categories */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                1. Target Feedback Categories (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {FEEDBACK_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Specific Instructions */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                2. Detailed Human Guidance & Strategy Instructions
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Example: Emphasize our new SOC-2 compliance features, make the tone slightly more executive and consultative, and prioritize LinkedIn thought leadership over short tweets..."
                rows={4}
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block text-right">
                {feedbackText.length} characters • Grounded strictly against immutable Brand DNA
              </span>
            </div>

            {/* Step 3: Selective Intelligence Rerun Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                3. Selective Multi-Agent Intelligence Resynchronization
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-indigo-500 transition-colors">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-semibold text-slate-900 dark:text-white">Market Research Agent</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectiveAgents.marketResearch}
                    onChange={(e) => setSelectiveAgents({ ...selectiveAgents, marketResearch: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>

                <label className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-indigo-500 transition-colors">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold text-slate-900 dark:text-white">Trend Intelligence Agent</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectiveAgents.trendIntelligence}
                    onChange={(e) => setSelectiveAgents({ ...selectiveAgents, trendIntelligence: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>

                <label className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-indigo-500 transition-colors">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="font-semibold text-slate-900 dark:text-white">Performance Forecasting</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectiveAgents.forecasting}
                    onChange={(e) => setSelectiveAgents({ ...selectiveAgents, forecasting: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>

                <label className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-indigo-500 transition-colors">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-500" />
                    <span className="font-semibold text-slate-900 dark:text-white">Brand Context RAG</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectiveAgents.brandContext}
                    onChange={(e) => setSelectiveAgents({ ...selectiveAgents, brandContext: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRefreshModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRefreshStrategy}
                disabled={refreshing}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing Multi-Agent Intelligence...' : `Re-Generate Strategy (v${version + 1})`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


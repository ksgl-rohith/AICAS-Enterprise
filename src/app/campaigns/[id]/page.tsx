'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Megaphone,
  Sparkles,
  Layers,
  CheckCircle2,
  ChevronRight,
  CalendarDays,
  Radio,
  Edit3,
  Save,
  RotateCcw,
  ShieldCheck,
  Building2,
  Target,
  FileText,
  UserCheck,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Edit / Human Rewrite State
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
      alert('Network error while saving human edits.');
    } finally {
      setSavingNarrative(false);
    }
  };

  if (loading || !campaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 text-xs gap-2">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading Campaign Workspace...</span>
      </div>
    );
  }

  const strategy = campaign.strategy;
  const pillars = strategy ? JSON.parse(strategy.contentPillarsJson || '[]') : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <PageHeader
        eyebrow={`Campaign Operations • ${campaign.brand?.name || 'Brand'}`}
        title={campaign.name}
        description={`Targeting ${campaign.targetAudience} across ${campaign.channels.replace(/,/g, ', ')}.`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Campaigns', href: '/campaigns' },
          { label: campaign.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/campaigns/${campaign.id}/strategy`}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-sm shadow-purple-600/30 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Strategy Workspace</span>
            </Link>

            <Link
              href={`/campaigns/${campaign.id}/content`}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <Layers className="w-4 h-4" />
              <span>Content Studio</span>
            </Link>
          </div>
        }
      />

      {/* Primary Workspaces Navigator Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href={`/campaigns/${campaign.id}/strategy`}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500/80 transition-all flex items-center justify-between group shadow-xs"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>AI Strategy & Content Pillars</span>
              {strategy && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                  GENERATED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {strategy
                ? `${pillars.length} Strategic Pillars established with multi-channel role assignments.`
                : 'Click to execute StrategyAgent and assemble grounded content pillars.'}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-purple-500 group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>

        <Link
          href={`/campaigns/${campaign.id}/content`}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/80 transition-all flex items-center justify-between group shadow-xs"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
              <Layers className="w-4 h-4" />
              <span>Multi-Agent Content Studio</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono font-bold">
                {campaign.contentItems?.length || 0} DRAFTS
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Copywriting & visual layout briefs generated across LinkedIn, Facebook, Instagram, & Telegram.
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-indigo-500 group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>
      </div>

      {/* AI Strategy Suggestion & Human Rewrite Workspace Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                AI Campaign Narrative & Strategy Suggestions
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                AI SUGGESTION
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review AI suggestions below. Human marketers can edit and rewrite any strategy narrative or positioning text.
            </p>
          </div>

          {strategy && (
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
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
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
                    <span>{savingNarrative ? 'Saving...' : 'Save Human Overrides'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {!strategy ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs space-y-3">
            <p>No strategy narrative generated yet.</p>
            <Link
              href={`/campaigns/${campaign.id}/strategy`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold text-xs shadow-sm"
            >
              <Sparkles className="w-4 h-4" /> Execute Strategy Agent
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Master Narrative */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Master Campaign Narrative
                </span>
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-indigo-400" /> Human Override Supported
                </span>
              </div>

              {!editingNarrative ? (
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                  "{strategy.campaignNarrative}"
                </p>
              ) : (
                <textarea
                  rows={3}
                  value={humanNarrative}
                  onChange={(e) => setHumanNarrative(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-500 text-xs text-slate-900 dark:text-white focus:outline-none"
                  placeholder="Rewrite campaign narrative..."
                />
              )}
            </div>

            {/* Objective & Audience Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">
                  AI Objective Interpretation
                </span>
                {!editingNarrative ? (
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {strategy.objectiveInterpretation}
                  </p>
                ) : (
                  <textarea
                    rows={2}
                    value={humanObjectiveText}
                    onChange={(e) => setHumanObjectiveText(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-500 text-xs text-slate-900 dark:text-white"
                  />
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">
                  AI Audience Alignment Summary
                </span>
                {!editingNarrative ? (
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {strategy.audienceSummary}
                  </p>
                ) : (
                  <textarea
                    rows={2}
                    value={humanAudienceText}
                    onChange={(e) => setHumanAudienceText(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-500 text-xs text-slate-900 dark:text-white"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generated Content Items Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" /> Generated Content Drafts ({campaign.contentItems?.length || 0})
          </h2>
          <Link
            href={`/campaigns/${campaign.id}/content`}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
          >
            Open Content Studio &rarr;
          </Link>
        </div>

        {(!campaign.contentItems || campaign.contentItems.length === 0) ? (
          <div className="text-center py-8 text-slate-400 text-xs space-y-2">
            <p>No content items generated yet for this campaign.</p>
            <Link
              href={`/campaigns/${campaign.id}/strategy`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold text-xs shadow-sm"
            >
              <Sparkles className="w-4 h-4" /> Generate Strategy & Content
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {campaign.contentItems.map((item: any, idx: number) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {item.format}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Pillar: {item.contentPillar}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                    {item.status}
                  </span>
                  <Link
                    href={`/campaigns/${campaign.id}/content`}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition-all"
                  >
                    Edit / Rewrite Copy
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

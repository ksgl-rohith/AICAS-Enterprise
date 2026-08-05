'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Eye,
  Calendar,
  FileImage,
  Layers3,
} from 'lucide-react';
import { VisualPreviewModal } from '@/components/ui/visual-preview-modal';
import { SchedulePreviewModal } from '@/components/ui/schedule-preview-modal';

export default function CampaignContentStudioPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [activeChannel, setActiveChannel] = useState<'linkedin' | 'facebook' | 'instagram' | 'telegram'>('linkedin');
  const [reviewing, setReviewing] = useState(false);

  // Modals state
  const [showVisualModal, setShowVisualModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

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

  const handleRunReview = async () => {
    setReviewing(true);
    try {
      const res = await fetch(`/api/campaigns/${params.id}/run-review`, { method: 'POST' });
      if (res.ok) {
        fetchCampaign();
      } else {
        alert('Review evaluation failed.');
      }
    } catch {
      alert('Error executing ReviewAgent.');
    } finally {
      setReviewing(false);
    }
  };

  if (loading || !campaign) {
    return <div className="text-center py-12 text-slate-500 text-xs">Loading Content Studio...</div>;
  }

  const items = campaign.contentItems || [];
  const currentItem = items[activeItemIndex];
  const variants = currentItem?.variants || [];
  const currentVariant = variants.find((v: any) => v.channel === activeChannel) || variants[0];
  const reviewResult = currentItem?.reviewResult;

  const slides = currentVariant?.carouselSlidesJson ? JSON.parse(currentVariant.carouselSlidesJson) : [];
  const imageBrief = currentVariant?.imageBriefJson ? JSON.parse(currentVariant.imageBriefJson) : null;
  const infographicData = currentVariant?.infographicSpecsJson ? JSON.parse(currentVariant.infographicSpecsJson) : null;
  const staticVisualData = currentVariant?.staticVisualJson ? JSON.parse(currentVariant.staticVisualJson) : null;

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/campaigns/${campaign.id}`} className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Multi-Agent Content Studio</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                Copywriting & Visual Previews
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Campaign: {campaign.name} • Brand: {campaign.brand?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Action Button: AI Schedule Preview */}
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>View AI Schedule Timeline</span>
          </button>

          {/* Action Button: Quality Review */}
          <button
            onClick={handleRunReview}
            disabled={reviewing || items.length === 0}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-600/30 flex items-center gap-2 transition-all"
          >
            <ShieldCheck className={`w-4 h-4 ${reviewing ? 'animate-spin' : ''}`} />
            <span>{reviewing ? 'Evaluating Quality Gates...' : 'Run Quality Review'}</span>
          </button>

          <Link
            href="/approvals"
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approval Queue</span>
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <Layers className="w-12 h-12 text-indigo-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Content Items Created Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Please generate a campaign strategy first, then trigger multi-agent content generation.
          </p>
          <Link
            href={`/campaigns/${campaign.id}/strategy`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            <Sparkles className="w-4 h-4" /> Go to AI Strategy Workspace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Topics / Items List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Content Draft Topics</h3>
            <div className="space-y-2">
              {items.map((item: any, idx: number) => (
                <button
                  key={item.id}
                  onClick={() => setActiveItemIndex(idx)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    idx === activeItemIndex
                      ? 'bg-indigo-600/10 border-indigo-500 text-slate-900 dark:text-white font-semibold shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">Item #{idx + 1}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                      {item.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold line-clamp-2">{item.title}</h4>
                </button>
              ))}
            </div>
          </div>

          {/* Center & Right Column: Variants Workspace & Review Report */}
          <div className="lg:col-span-3 space-y-6">
            {/* Channel Tabs Selector & Visual Preview Trigger */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">{currentItem.title}</h2>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Pillar: {currentItem.contentPillar} • Format: {currentItem.format}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* VISUAL PREVIEW BUTTON */}
                  <button
                    onClick={() => setShowVisualModal(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview Visual Studio Artifact</span>
                  </button>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                    {currentItem.status}
                  </span>
                </div>
              </div>

              {/* Channel Selector Buttons */}
              <div className="flex items-center gap-2">
                {(['linkedin', 'facebook', 'instagram', 'telegram'] as const).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setActiveChannel(ch)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      activeChannel === ch
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Variant Workspace */}
            {!currentVariant ? (
              <div className="p-6 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-xs text-slate-500">
                No variant generated for channel {activeChannel}.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Variant Text Copy */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                      {currentVariant.channel} Copy Draft
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Grounded RAG</span>
                  </div>

                  {currentVariant.headline && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white text-xs">
                      {currentVariant.headline}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Hook</span>
                    <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium">
                      {currentVariant.hook}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Body Copy</span>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                      {currentVariant.bodyText}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">CTA</span>
                    <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                      {currentVariant.ctaText}
                    </p>
                  </div>

                  {currentVariant.hashtags && (
                    <div className="text-xs text-purple-600 dark:text-purple-400 font-mono">
                      {currentVariant.hashtags}
                    </div>
                  )}
                </div>

                {/* Right Column: Visual Preview Banner & Review Scores */}
                <div className="space-y-6">
                  {/* Visual Studio Card Banner */}
                  <div className="p-6 rounded-3xl bg-gradient-to-tr from-indigo-900/40 via-purple-900/40 to-slate-900 border border-indigo-500/30 text-white space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                        Visual Generation Agents Active
                      </span>
                      <Eye className="w-5 h-5 text-indigo-300" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Visual Artifact Ready for Preview</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Image, Carousel, Infographic, and Static Visual Agents have compiled rendered layout briefs for this content.
                    </p>
                    <button
                      onClick={() => setShowVisualModal(true)}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
                    >
                      <Eye className="w-4 h-4" /> Open Visual Studio Preview
                    </button>
                  </div>

                  {/* Automated Quality Review Scores */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Automated Quality Review Report
                      </span>
                      {reviewResult && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          reviewResult.overallStatus === 'passed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-600 dark:text-amber-300'
                        }`}>
                          {reviewResult.overallStatus.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {!reviewResult ? (
                      <p className="text-xs text-slate-500">No review executed yet. Click "Run Quality Review" above.</p>
                    ) : (
                      <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 uppercase block">Brand Score</span>
                            <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">{reviewResult.brandScore}/100</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 uppercase block">Factual Risk</span>
                            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">{reviewResult.factualRiskScore}/100</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400 uppercase block">Compliance</span>
                            <span className="text-base font-bold text-purple-600 dark:text-purple-400">{reviewResult.complianceScore}/100</span>
                          </div>
                        </div>

                        {reviewResult.warningsJson && JSON.parse(reviewResult.warningsJson).length > 0 && (
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] space-y-1">
                            <div className="font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Compliance Warnings:
                            </div>
                            <ul className="list-disc list-inside space-y-0.5">
                              {JSON.parse(reviewResult.warningsJson).map((w: string, idx: number) => (
                                <li key={idx}>{w}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visual Preview Modal */}
      <VisualPreviewModal
        isOpen={showVisualModal}
        onClose={() => setShowVisualModal(false)}
        title={currentItem?.title || 'Visual Artifact'}
        channel={activeChannel}
        imageBrief={imageBrief}
        carouselData={{ slides }}
        infographicData={infographicData}
        staticVisualData={staticVisualData}
      />

      {/* Schedule Preview Modal */}
      <SchedulePreviewModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        campaignName={campaign.name}
        schedules={campaign.schedules}
      />
    </div>
  );
}

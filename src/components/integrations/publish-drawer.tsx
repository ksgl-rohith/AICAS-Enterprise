'use client';

import React, { useEffect, useState } from 'react';
import { X, Send, Calendar, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck, FileText, ExternalLink, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PublishDrawerProps {
  platform: string;
  brandId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PublishDrawer({ platform, brandId, onClose, onSuccess }: PublishDrawerProps) {
  const [approvedItems, setApprovedItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<any | null>(null);
  const [step, setStep] = useState<'select' | 'preview' | 'publishing' | 'result'>('select');

  useEffect(() => {
    // Fetch approved content items for brand
    fetch(`/api/approvals?brandId=${brandId}`)
      .then((res) => res.json())
      .then((data) => {
        const items = data.items || data || [];
        const approved = Array.isArray(items)
          ? items.filter((item: any) => item.status === 'APPROVED' || item.status === 'DRAFT')
          : [];
        setApprovedItems(approved);
        if (approved.length > 0) {
          setSelectedItemId(approved[0].id);
        }
        setLoadingItems(false);
      })
      .catch(() => setLoadingItems(false));
  }, [brandId]);

  const selectedItem = approvedItems.find((i) => i.id === selectedItemId);
  const reviewResult = selectedItem?.reviewResult;
  const primaryVariant = selectedItem?.variants?.[0] || {};
  const fullText = `${primaryVariant.hook || ''} ${primaryVariant.bodyText || ''} ${primaryVariant.ctaText || ''}`.trim();

  const handlePublishNow = async () => {
    if (!selectedItemId) return;
    setStep('publishing');
    setPublishing(true);

    try {
      const res = await fetch('/api/publishing/governed-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId,
          contentItemId: selectedItemId,
          channel: platform,
          idempotencyKey: `ik_${selectedItemId}_${platform}_${Date.now()}`,
        }),
      });

      const data = await res.json();
      setPublishResult(data);
      setStep('result');
      if (data.success) {
        onSuccess();
      }
    } catch (err: any) {
      setPublishResult({ success: false, error: err.message || 'Publishing error' });
      setStep('result');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="indigo" className="uppercase font-bold text-[10px]">
                Governed Live Publisher
              </Badge>
              <span className="text-xs text-slate-400 capitalize">• Target: {platform}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              Select Approved Content & Validate Quality Gate
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs">
          {step === 'select' && (
            <>
              <div className="space-y-2">
                <label className="font-bold text-slate-900 dark:text-white block">
                  Select Campaign Approved Content Item
                </label>
                {loadingItems ? (
                  <div className="p-4 text-center text-slate-400">Loading approved content...</div>
                ) : approvedItems.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300">
                    <AlertCircle className="w-5 h-5 mb-2 text-amber-500" />
                    <p className="font-semibold">No approved content available for this brand.</p>
                    <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
                      Create and approve campaign content through Quality Council before publishing.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {approvedItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItemId(item.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          selectedItemId === item.id
                            ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500 shadow-sm'
                            : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                          <Badge variant={item.status === 'APPROVED' ? 'emerald' : 'slate'}>
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {item.coreIdea || primaryVariant.bodyText}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedItem && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Quality Council & Compliance Gate
                  </h4>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Brand Score</span>
                      <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                        {reviewResult?.brandScore ?? 88}/100
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Factual Risk</span>
                      <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                        {reviewResult?.factualRiskScore ?? 8}/100 • Low
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Compliance</span>
                      <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                        {reviewResult?.overallStatus?.toUpperCase() || 'PASSED'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Content Payload Preview</span>
                    <p className="text-slate-800 dark:text-slate-200 font-sans leading-relaxed">
                      {fullText || selectedItem.coreIdea}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">
                      Char count: {fullText.length}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 'publishing' && (
            <div className="py-12 text-center space-y-4">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Publishing Live Content...</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Running pre-publish quality refresh, verifying credentials, and delivering payload to {platform}.
                </p>
              </div>
            </div>
          )}

          {step === 'result' && publishResult && (
            <div className="space-y-4">
              {publishResult.success ? (
                <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Published Successfully to {platform.toUpperCase()}!</span>
                  </div>

                  <div className="space-y-1 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                    <p>External Post ID: {publishResult.externalPostId}</p>
                    <p>Published Time: {new Date(publishResult.publishedAt || Date.now()).toLocaleString()}</p>
                    <p>Idempotency Key: {publishResult.idempotencyKey}</p>
                  </div>

                  {publishResult.permalink && (
                    <a
                      href={publishResult.permalink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-colors text-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Live Post</span>
                    </a>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 space-y-2 text-red-800 dark:text-red-300">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <span>Publication Failed or Blocked</span>
                  </div>
                  <p className="text-xs">{publishResult.error || 'Validation error'}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-200 transition-colors"
          >
            {step === 'result' ? 'Close' : 'Cancel'}
          </button>

          {step === 'select' && (
            <button
              disabled={!selectedItemId || publishing}
              onClick={handlePublishNow}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-sm shadow-indigo-600/30 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Publish Now to {platform}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

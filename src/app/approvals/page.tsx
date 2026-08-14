'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, ThumbsUp, RotateCcw, Ban } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { useWorkspace } from '@/components/workspace-context';

export default function ApprovalsPage() {
  const { activeWorkspace } = useWorkspace();
  const [items, setItems] = useState<any[]>([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, revisionRequested: 0, all: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [reviewerComment, setReviewerComment] = useState<{ [id: string]: string }>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchItems = (wsId?: string) => {
    setLoading(true);
    const targetWs = wsId || activeWorkspace?.id || 'tenant-default';
    fetch(`/api/approvals?workspaceId=${targetWs}&status=${filter.toUpperCase()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.queue) {
          setItems(data.queue);
          if (data.counts) setCounts(data.counts);
        } else if (Array.isArray(data)) {
          setItems(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems(activeWorkspace?.id);

    const handleWorkspaceChanged = (e: any) => {
      fetchItems(e.detail?.workspaceId);
    };

    window.addEventListener('workspace-changed', handleWorkspaceChanged);
    return () => {
      window.removeEventListener('workspace-changed', handleWorkspaceChanged);
    };
  }, [filter, activeWorkspace?.id]);

  const handleDecision = async (contentItemId: string, decision: 'APPROVED' | 'REVISION_REQUESTED' | 'REJECTED') => {
    setProcessingId(contentItemId);
    const comment = reviewerComment[contentItemId] || '';
    const action = decision === 'APPROVED' ? 'approve' : decision === 'REJECTED' ? 'reject' : 'request_revision';

    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentItemId,
          action,
          decision,
          comment,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchItems(activeWorkspace?.id);
      } else {
        alert(data.error || 'Failed to record approval decision.');
      }
    } catch {
      alert('Error submitting decision.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Workspace: ${activeWorkspace?.name || 'Enterprise'}`}
        title="Human Oversight & Approval Queue"
        description="Review AI-generated post drafts against brand voice scores, factual grounding evidence, and compliance guardrails."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Campaign Operations' },
          { label: 'Approval Queue' },
        ]}
        actions={
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'pending'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Pending ({counts.pending})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Approved ({counts.approved})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Items ({counts.all})
            </button>
          </div>
        }
      />

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-xs font-medium">Loading approval queue...</div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={`Approval Queue is Clear for ${activeWorkspace?.name || 'Workspace'}`}
          description={`There are currently no items matching the '${filter}' status filter in this workspace.`}
          action={
            filter !== 'all' ? (
              <button
                onClick={() => setFilter('all')}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                View All Items ({counts.all})
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-6">
          {items.map((item) => {
            const review = item.reviewResult;
            const variants = item.variants || [];
            const primaryVariant = variants[0];
            const warnings = review?.warningsJson ? JSON.parse(review.warningsJson) : [];
            const isApproved = item.status === 'APPROVED' || item.status === 'SCHEDULED' || item.status === 'PUBLISHED';

            return (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h2>
                      <Badge
                        variant={
                          isApproved
                            ? 'emerald'
                            : item.status === 'NEEDS_REVISION'
                            ? 'amber'
                            : item.status === 'REJECTED'
                            ? 'red'
                            : 'indigo'
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Campaign: <strong className="text-slate-800 dark:text-slate-200">{item.campaign?.name || 'Campaign'}</strong> • Brand:{' '}
                      <strong className="text-slate-800 dark:text-slate-200">{item.campaign?.brand?.name || 'Brand'}</strong> • Pillar:{' '}
                      <strong className="text-indigo-600 dark:text-indigo-400">{item.contentPillar}</strong>
                    </p>
                  </div>

                  {/* Quality Scores */}
                  {review && (
                    <div className="flex items-center gap-2 text-center text-xs shrink-0">
                      <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase block font-semibold">
                          Brand Score
                        </span>
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {review.brandScore}/100
                        </span>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase block font-semibold">
                          Factual Risk
                        </span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {review.factualRiskScore}/100
                        </span>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase block font-semibold">
                          Compliance
                        </span>
                        <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                          {review.complianceScore}/100
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Variant Preview */}
                {primaryVariant && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                      <span>Primary Variant: {primaryVariant.channel}</span>
                      {primaryVariant.hashtags && (
                        <span className="text-purple-600 dark:text-purple-400">{primaryVariant.hashtags}</span>
                      )}
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-sans">{primaryVariant.hook}</p>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans text-[11.5px] border-t border-slate-200 dark:border-slate-900 pt-2">
                      {primaryVariant.bodyText}
                    </p>
                    <div className="text-indigo-600 dark:text-indigo-300 font-semibold pt-1">
                      CTA: {primaryVariant.ctaText}
                    </div>
                  </div>
                )}

                {/* Compliance Warnings */}
                {warnings.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block">Compliance Check Warnings:</strong>
                      <ul className="list-disc list-inside space-y-0.5 text-amber-700 dark:text-amber-200">
                        {warnings.map((w: string, idx: number) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Decision Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Add reviewer notes or feedback comments..."
                      value={reviewerComment[item.id] || ''}
                      onChange={(e) => setReviewerComment({ ...reviewerComment, [item.id]: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {!isApproved ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDecision(item.id, 'REVISION_REQUESTED')}
                        disabled={processingId === item.id}
                        className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Request Revision</span>
                      </button>

                      <button
                        onClick={() => handleDecision(item.id, 'REJECTED')}
                        disabled={processingId === item.id}
                        className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleDecision(item.id, 'APPROVED')}
                        disabled={processingId === item.id}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{processingId === item.id ? 'Approving...' : 'Approve for Schedule'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Approved & Schedulable</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

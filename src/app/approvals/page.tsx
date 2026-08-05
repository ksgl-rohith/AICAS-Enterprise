'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, MessageSquare, ThumbsUp, RotateCcw, Ban } from 'lucide-react';

export default function ApprovalsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all' | 'approved'>('pending');
  const [reviewerComment, setReviewerComment] = useState<{ [id: string]: string }>({});

  const fetchItems = () => {
    fetch('/api/approvals')
      .then((res) => res.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDecision = async (contentItemId: string, decision: 'APPROVED' | 'REVISION_REQUESTED' | 'REJECTED') => {
    const comment = reviewerComment[contentItemId] || '';
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentItemId,
          decision,
          comment,
        }),
      });

      if (res.ok) {
        fetchItems();
      } else {
        alert('Failed to record approval decision.');
      }
    } catch {
      alert('Error submitting decision.');
    }
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'pending') return item.status === 'IN_REVIEW' || item.status === 'NEEDS_REVISION' || item.status === 'DRAFT';
    if (filter === 'approved') return item.status === 'APPROVED' || item.status === 'SCHEDULED' || item.status === 'PUBLISHED';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Human Oversight & Approval Queue</h1>
          <p className="text-xs text-slate-400">
            Review AI-generated post drafts against brand voice scores, factual grounding evidence, and compliance guardrails.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'pending' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Pending Review ({items.filter((i) => i.status === 'IN_REVIEW' || i.status === 'NEEDS_REVISION' || i.status === 'DRAFT').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'approved' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            All Items ({items.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs">Loading approval queue...</div>
      ) : filteredItems.length === 0 ? (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Approval Queue is Clear</h3>
          <p className="text-xs text-slate-400">No content items matching current filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredItems.map((item) => {
            const review = item.reviewResult;
            const variants = item.variants || [];
            const primaryVariant = variants[0];
            const warnings = review?.warningsJson ? JSON.parse(review.warningsJson) : [];

            return (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-white">{item.title}</h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Campaign: <strong className="text-slate-200">{item.campaign?.name}</strong> • Brand:{' '}
                      <strong className="text-slate-200">{item.campaign?.brand?.name}</strong> • Pillar:{' '}
                      <strong className="text-purple-400">{item.contentPillar}</strong>
                    </p>
                  </div>

                  {/* Quality Scores */}
                  {review && (
                    <div className="flex items-center gap-2 text-center text-xs">
                      <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-500 uppercase block font-semibold">Brand Score</span>
                        <span className="text-sm font-bold text-indigo-400">{review.brandScore}/100</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-500 uppercase block font-semibold">Factual Risk</span>
                        <span className="text-sm font-bold text-emerald-400">{review.factualRiskScore}/100</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[9px] text-slate-500 uppercase block font-semibold">Compliance</span>
                        <span className="text-sm font-bold text-purple-400">{review.complianceScore}/100</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Variant Preview */}
                {primaryVariant && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-indigo-400 font-bold uppercase">
                      <span>Primary Variant: {primaryVariant.channel}</span>
                      {primaryVariant.hashtags && <span className="text-purple-400">{primaryVariant.hashtags}</span>}
                    </div>
                    <p className="text-slate-200 leading-relaxed font-sans">{primaryVariant.hook}</p>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap font-sans text-[11.5px] border-t border-slate-900 pt-2">
                      {primaryVariant.bodyText}
                    </p>
                    <div className="text-indigo-300 font-semibold pt-1">
                      CTA: {primaryVariant.ctaText}
                    </div>
                  </div>
                )}

                {/* Compliance Warnings */}
                {warnings.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block">Compliance Check Warnings:</strong>
                      <ul className="list-disc list-inside space-y-0.5 text-amber-200">
                        {warnings.map((w: string, idx: number) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Reviewer Comment & Decision Buttons */}
                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Add reviewer notes or feedback comments..."
                      value={reviewerComment[item.id] || ''}
                      onChange={(e) => setReviewerComment({ ...reviewerComment, [item.id]: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDecision(item.id, 'REVISION_REQUESTED')}
                      className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Request Revision</span>
                    </button>

                    <button
                      onClick={() => handleDecision(item.id, 'REJECTED')}
                      className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => handleDecision(item.id, 'APPROVED')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Approve for Schedule</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Sparkles, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([
    {
      id: 'rec_01',
      targetChannel: 'linkedin',
      bestPillar: 'Multi-Agent Governance & Brand Safety',
      recommendedTopic: '5 Governance Checkpoints Before Publishing AI Content in Enterprise SaaS',
      confidence: 0.94,
      source: 'CONTROLLED_EXPERIMENT',
      status: 'proposed',
      explanation: 'LinkedIn technical carousels generated 3.4x higher CTR (4.8% vs 1.4% baseline) in controlled experiment exp_01.',
      proposedPolicyUpdate: 'Prefer technical carousel format for LinkedIn SaaS campaigns when target audience is technical decision makers.',
    },
  ]);

  const [policies] = useState([
    {
      id: 'policy_01',
      learnedPreference: 'Technical carousels outperform text posts on LinkedIn by +240% CTR',
      confidence: 0.95,
      status: 'APPROVED_LEARNED_POLICY',
      scopeChannel: 'linkedin',
      approverId: 'admin_reviewer_1',
    },
  ]);

  const handleApprove = (id: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
    );
  };

  const handleReject = (id: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Intelligence & Growth"
        title="Optimization Recommendations & Policy Memory"
        description="Review next-post recommendations, evidence provenance, and versioned learning policies before activation."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Intelligence & Growth' },
          { label: 'Recommendations' },
        ]}
      />

      {/* Recommendation Inbox */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Pending Next-Post Recommendations</h2>

        <div className="space-y-3 text-xs">
          {recommendations.map((rec) => (
            <div key={rec.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">{rec.targetChannel}</span>
                  <Badge variant="purple">Source: {rec.source}</Badge>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Confidence: {(rec.confidence * 100).toFixed(0)}%</span>
                </div>

                <Badge variant={rec.status === 'approved' ? 'emerald' : rec.status === 'rejected' ? 'red' : 'amber'}>
                  Status: {rec.status}
                </Badge>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{rec.recommendedTopic}</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{rec.explanation}</p>
              </div>

              {rec.proposedPolicyUpdate && (
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/40 space-y-1">
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 uppercase font-bold block">Proposed Policy Memory Update</span>
                  <p className="text-slate-800 dark:text-slate-200">{rec.proposedPolicyUpdate}</p>
                </div>
              )}

              {rec.status === 'proposed' && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => handleReject(rec.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5 text-red-500" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleApprove(rec.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1 shadow-sm shadow-emerald-600/30 transition-all"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve Policy Update</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Approved Learning Memory */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Active Approved Learned Policies
        </h2>

        <div className="space-y-2 text-xs">
          {policies.map((p) => (
            <div key={p.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">{p.learnedPreference}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Scope: {p.scopeChannel} | Approver: {p.approverId} | Confidence: {(p.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <Badge variant="emerald">IMMUTABLE BRAND RULES PROTECTED</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

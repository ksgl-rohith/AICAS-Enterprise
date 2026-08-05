'use client';

import React, { useState } from 'react';
import { AlertTriangle, Eye } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';

export default function FatiguePage() {
  const [warnings] = useState([
    {
      id: 'fatigue_01',
      fatigueType: 'REPEATED_HOOK',
      similarityScore: 0.88,
      contentTitle: '5 Governance Checkpoints in Enterprise SaaS',
      explanation: 'Hook similarity (88%) exceeds fatigue threshold with post published 2 days ago ("5 AI Governance Rules").',
      detectedAt: '2026-08-05T18:30:00Z',
    },
    {
      id: 'fatigue_02',
      fatigueType: 'OVERUSED_CTA',
      similarityScore: 0.92,
      contentTitle: 'Multi-Agent Quality Council Blueprint',
      explanation: 'CTA "Schedule an Enterprise AI Governance Workshop" used 7 times across LinkedIn posts this week.',
      detectedAt: '2026-08-05T19:15:00Z',
    },
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Intelligence & Growth"
        title="Creative Fatigue & Content Decay Warnings"
        description="Embedding and metadata similarity analysis detecting hook repetition, CTA saturation, and audience fatigue."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Intelligence & Growth' },
          { label: 'Fatigue & Decay' },
        ]}
        actions={
          <Badge variant="amber" icon={<AlertTriangle className="w-3.5 h-3.5" />}>
            {warnings.length} Active Warnings
          </Badge>
        }
      />

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Eye className="w-4 h-4 text-amber-500" /> Detected Fatigue Signals (Explainable Similarity)
        </h2>

        <div className="space-y-3 text-xs">
          {warnings.map((w) => (
            <div key={w.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="amber">{w.fatigueType}</Badge>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  Similarity Score: {(w.similarityScore * 100).toFixed(0)}%
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{w.contentTitle}</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{w.explanation}</p>
              </div>

              <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Detected: {new Date(w.detectedAt).toLocaleString()}</span>
                <span>•</span>
                <span className="text-amber-700 dark:text-amber-400 font-semibold">Policy Enforcement: Require Revision</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

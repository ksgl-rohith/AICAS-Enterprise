'use client';

import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  Search,
  Sparkles,
  BookOpen,
  Calendar,
  Zap,
} from 'lucide-react';

export interface QualityCouncilViewProps {
  contentTitle: string;
  brandScore: number;
  factualRiskScore: number;
  complianceScore: number;
  accessibilityScore: number;
  seoScore: number;
  overallStatus: 'passed' | 'needs_revision' | 'blocked';
  claims?: Array<{
    claimId: string;
    extractedText: string;
    claimType: string;
    classification: string;
    confidence: number;
    isHighRisk: boolean;
    correctedWording?: string;
  }>;
  violations?: Array<{
    code: string;
    severity: string;
    message: string;
    recommendedCorrection: string;
  }>;
  evidencePack?: Array<{
    evidenceId: string;
    sourceTitle: string;
    retrievedExcerpt: string;
    trustLevel: string;
    confidence: number;
  }>;
  revisions?: Array<{
    attempt: number;
    status: string;
    requestedBy: string;
  }>;
}

export function QualityCouncilView({
  contentTitle,
  brandScore,
  factualRiskScore,
  complianceScore,
  accessibilityScore,
  seoScore,
  overallStatus,
  claims = [],
  violations = [],
  evidencePack = [],
  revisions = [],
}: QualityCouncilViewProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
          </span>
        );
      case 'needs_revision':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" /> REVISION REQUIRED
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> BLOCKED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <HelpCircle className="w-3.5 h-3.5" /> PENDING
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 p-6 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 text-slate-100 shadow-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            Quality Council Governance Audit
          </div>
          <h2 className="text-xl font-bold text-white mt-1">{contentTitle}</h2>
        </div>
        <div>{getStatusBadge(overallStatus)}</div>
      </div>

      {/* Scoreboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <div className="text-xs text-slate-400 font-medium mb-1">Brand DNA Score</div>
          <div className="text-2xl font-black text-indigo-400">{brandScore}/100</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <div className="text-xs text-slate-400 font-medium mb-1">Factual Risk</div>
          <div className={`text-2xl font-black ${factualRiskScore > 30 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {factualRiskScore}/100
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <div className="text-xs text-slate-400 font-medium mb-1">Compliance</div>
          <div className="text-2xl font-black text-emerald-400">{complianceScore}%</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <div className="text-xs text-slate-400 font-medium mb-1">Accessibility</div>
          <div className="text-2xl font-black text-amber-400">{accessibilityScore}%</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <div className="text-xs text-slate-400 font-medium mb-1">SEO & Discovery</div>
          <div className="text-2xl font-black text-cyan-400">{seoScore}%</div>
        </div>
      </div>

      {/* Claim Verification Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-400" />
          Fact Claim Verification Table ({claims.length})
        </h3>
        {claims.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-800/20 text-xs text-slate-400 italic text-center">
            No numerical or statistical claims extracted.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3">Claim Text</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Classification</th>
                  <th className="p-3">Confidence</th>
                  <th className="p-3">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                {claims.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="p-3 text-slate-200 font-medium">{c.extractedText}</td>
                    <td className="p-3 text-slate-400">{c.claimType}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.classification === 'supported'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : c.classification === 'unsupported'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {c.classification}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{(c.confidence * 100).toFixed(0)}%</td>
                    <td className="p-3 font-semibold">
                      {c.isHighRisk ? (
                        <span className="text-rose-400">HIGH RISK</span>
                      ) : (
                        <span className="text-slate-400">NORMAL</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Compliance Violations */}
      {violations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Compliance Violations & Policy Checks ({violations.length})
          </h3>
          <div className="space-y-2">
            {violations.map((v, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 space-y-1"
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="font-mono text-rose-300">{v.code}</span>
                  <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                    {v.severity}
                  </span>
                </div>
                <p>{v.message}</p>
                <p className="text-slate-400 italic">Recommended: {v.recommendedCorrection}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence Pack Drawer */}
      {evidencePack.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            Grounded Evidence Pack ({evidencePack.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {evidencePack.map((ev, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between text-cyan-400 font-semibold">
                  <span>{ev.sourceTitle}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                    {ev.trustLevel}
                  </span>
                </div>
                <p className="text-slate-300 line-clamp-2 italic">"{ev.retrievedExcerpt}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

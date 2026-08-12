'use client';

import React, { useEffect, useState } from 'react';
import { X, GitMerge, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PotentialDuplicatesModalProps {
  onClose: () => void;
  onMerged: () => void;
}

export function PotentialDuplicatesModal({ onClose, onMerged }: PotentialDuplicatesModalProps) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [merging, setMerging] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const fetchCandidates = () => {
    fetch('/api/brands/duplicates')
      .then((res) => res.json())
      .then((data) => {
        setCandidates(data.candidatePairs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleMerge = async (canonicalBrandId: string, mergedBrandId: string) => {
    setMerging(true);
    setResultMessage(null);

    try {
      const res = await fetch('/api/brands/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canonicalBrandId,
          mergedBrandId,
          reason: 'Administrator confirmed brand consolidation from Potential Duplicates Review utility.',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResultMessage(`Successfully consolidated duplicate brand profile! Migrated campaigns and knowledge sources.`);
        fetchCandidates();
        onMerged();
      } else {
        alert(data.error || 'Merge failed.');
      }
    } catch {
      alert('Error initiating brand merge.');
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl max-h-[90vh] flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-amber-500" />
              <span>Potential Brand Profile Duplicates Review</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Safely consolidate duplicate brand records while preserving campaigns, knowledge chunks, and audit logs.
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
          {resultMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{resultMessage}</span>
            </div>
          )}

          {loading ? (
            <div className="py-8 text-center text-slate-400">Scanning brand profiles for domain and name overlaps...</div>
          ) : candidates.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-900 dark:text-white">Zero Duplicate Brand Profiles Found!</p>
              <p className="text-xs">All active brand profiles in this tenant are unique and canonical.</p>
            </div>
          ) : (
            candidates.map((pair, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="amber" className="font-bold text-[10px]">
                    {pair.reason}
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Confidence: {(pair.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Brand Profile A</span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{pair.brandA.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {pair.brandA.normalizedDomain || pair.brandA.industry}
                    </p>
                    <button
                      disabled={merging}
                      onClick={() => handleMerge(pair.brandA.id, pair.brandB.id)}
                      className="mt-2 w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] transition-colors"
                    >
                      Keep A & Merge B Into A
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Brand Profile B</span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{pair.brandB.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {pair.brandB.normalizedDomain || pair.brandB.industry}
                    </p>
                    <button
                      disabled={merging}
                      onClick={() => handleMerge(pair.brandB.id, pair.brandA.id)}
                      className="mt-2 w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] transition-colors"
                    >
                      Keep B & Merge A Into B
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

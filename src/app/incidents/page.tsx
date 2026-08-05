'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  PauseCircle,
  PlayCircle,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';

export default function IncidentsOperationsPage() {
  const [dlqItems, setDlqItems] = useState<any[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [manualNote, setManualNote] = useState<{ [id: string]: string }>({});

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/incidents').then((res) => res.json()),
      fetch('/api/publishing/ledger').then((res) => res.json()),
    ])
      .then(([incData, ledData]) => {
        setDlqItems(incData.items || []);
        setLedgerEntries(ledData.entries || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolveDLQ = async (dlqId: string, action: 'resolve_manual' | 'resolve_retry') => {
    const note = manualNote[dlqId] || 'Manual resolution';
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, dlqId, note }),
      });
      if (res.ok) {
        fetchData();
      } else {
        alert('Failed to resolve DLQ item.');
      }
    } catch {
      alert('Error updating DLQ item.');
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Operations & Resilience"
        title="Dead-Letter Queue & Incident Operations"
        description="Monitor dead-letter items, transient vs. permanent connector errors, financial publication ledger entries, and crisis pause controls."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Governance' },
          { label: 'Incidents' },
        ]}
        actions={
          <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-right text-xs">
              <div className="font-bold text-slate-900 dark:text-white">Emergency Crisis Pause</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Halt all scheduled brand publications</div>
            </div>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all ${
                isPaused
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
              }`}
            >
              {isPaused ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
              {isPaused ? 'Resume Campaigns' : 'Activate Crisis Pause'}
            </button>
          </div>
        }
      />

      {/* Dead Letter Queue Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            Dead-Letter Queue (DLQ) Open Incidents ({dlqItems.length})
          </h2>
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs">Loading incident queue...</div>
        ) : dlqItems.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No Open Incidents in DLQ"
            description="All connector transactions and workflows are healthy."
          />
        ) : (
          <div className="space-y-3">
            {dlqItems.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="red">{item.errorCategory}</Badge>
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">{item.platform}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    Logged: {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="text-xs text-red-700 dark:text-red-300 font-medium">{item.errorMessage}</div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <input
                    type="text"
                    placeholder="Resolution notes..."
                    value={manualNote[item.id] || ''}
                    onChange={(e) => setManualNote({ ...manualNote, [item.id]: e.target.value })}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400"
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleResolveDLQ(item.id, 'resolve_retry')}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm shadow-indigo-600/30 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Re-trigger Retry
                    </button>
                    <button
                      onClick={() => handleResolveDLQ(item.id, 'resolve_manual')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                    >
                      Resolve Manually
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Publication Ledger History */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Financial Publication Transaction Ledger ({ledgerEntries.length})
        </h2>

        {ledgerEntries.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500">No ledger entries recorded yet.</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Publication ID</th>
                  <th className="p-3">Platform</th>
                  <th className="p-3">Idempotency Key</th>
                  <th className="p-3">Attempts</th>
                  <th className="p-3">State</th>
                  <th className="p-3">Post ID / Permalink</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-slate-700 dark:text-slate-300">
                {ledgerEntries.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{l.publicationId}</td>
                    <td className="p-3 uppercase text-indigo-600 dark:text-indigo-400">{l.platform}</td>
                    <td className="p-3 text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{l.idempotencyKey}</td>
                    <td className="p-3 tabular-nums">{l.attemptCount}</td>
                    <td className="p-3">
                      <Badge variant={l.currentState === 'PUBLISHED' ? 'emerald' : l.currentState.includes('FAILED') ? 'red' : 'amber'}>
                        {l.currentState}
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400">
                      {l.platformPostId ? (
                        <a href={l.permalink || '#'} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 underline">
                          {l.platformPostId}
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

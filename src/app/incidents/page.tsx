'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  XCircle,
  PauseCircle,
  PlayCircle,
  FileSpreadsheet,
  ShieldAlert,
  Clock,
} from 'lucide-react';

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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            Operations & Resilience Dashboard
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Dead-Letter Queue & Incident Operations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor dead-letter items, transient vs. permanent connector errors, financial publication ledger entries, and crisis pause controls.
          </p>
        </div>

        {/* Emergency Crisis Pause Controls */}
        <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
          <div className="text-right text-xs">
            <div className="font-bold text-white">Emergency Crisis Pause</div>
            <div className="text-[10px] text-slate-400">Halt all scheduled brand publications</div>
          </div>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
              isPaused
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
            }`}
          >
            {isPaused ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
            {isPaused ? 'Resume Campaigns' : 'Activate Crisis Pause'}
          </button>
        </div>
      </div>

      {/* Dead Letter Queue Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Dead-Letter Queue (DLQ) Open Incidents ({dlqItems.length})
          </h2>
          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500 text-xs">Loading incident queue...</div>
        ) : dlqItems.length === 0 ? (
          <div className="p-6 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <div className="text-sm font-bold text-white">No Open Incidents in DLQ</div>
            <div className="text-xs text-slate-400">All connector transactions and workflows are healthy.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {dlqItems.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-900 border border-rose-500/20 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300">
                      {item.errorCategory}
                    </span>
                    <span className="text-xs font-bold text-white uppercase">{item.platform}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Logged: {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="text-xs text-rose-200 font-medium">{item.errorMessage}</div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <input
                    type="text"
                    placeholder="Resolution notes..."
                    value={manualNote[item.id] || ''}
                    onChange={(e) => setManualNote({ ...manualNote, [item.id]: e.target.value })}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500"
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleResolveDLQ(item.id, 'resolve_retry')}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Re-trigger Retry
                    </button>
                    <button
                      onClick={() => handleResolveDLQ(item.id, 'resolve_manual')}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
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
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          Financial Publication Transaction Ledger ({ledgerEntries.length})
        </h2>

        {ledgerEntries.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500">No ledger entries recorded yet.</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3">Publication ID</th>
                  <th className="p-3">Platform</th>
                  <th className="p-3">Idempotency Key</th>
                  <th className="p-3">Attempts</th>
                  <th className="p-3">State</th>
                  <th className="p-3">Post ID / Permalink</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/40 font-mono">
                {ledgerEntries.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/30">
                    <td className="p-3 text-slate-200">{l.publicationId}</td>
                    <td className="p-3 uppercase text-cyan-400">{l.platform}</td>
                    <td className="p-3 text-slate-400 truncate max-w-[150px]">{l.idempotencyKey}</td>
                    <td className="p-3 text-slate-300">{l.attemptCount}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          l.currentState === 'PUBLISHED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : l.currentState.includes('FAILED')
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {l.currentState}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">
                      {l.platformPostId ? (
                        <a href={l.permalink || '#'} target="_blank" rel="noreferrer" className="text-indigo-400 underline">
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

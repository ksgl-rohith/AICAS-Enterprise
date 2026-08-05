'use client';

import React, { useEffect, useState } from 'react';
import { History, ShieldCheck, User, Building2, Megaphone, CheckCircle2, Send, FileText, Layers } from 'lucide-react';

export default function ActivityPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/activity')
      .then((res) => res.json())
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'BRAND_CREATED':
        return { color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: Building2 };
      case 'DOCUMENT_UPLOADED':
        return { color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', icon: FileText };
      case 'CAMPAIGN_CREATED':
      case 'STRATEGY_GENERATED':
        return { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: Megaphone };
      case 'CONTENT_GENERATED':
        return { color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: Layers };
      case 'APPROVED':
      case 'REVIEW_PASSED':
        return { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: CheckCircle2 };
      case 'PUBLISHED_SIMULATED':
      case 'PUBLISHED_LIVE':
        return { color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: Send };
      default:
        return { color: 'bg-slate-800 text-slate-300 border-slate-700', icon: History };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">System Audit & Lineage Timeline</h1>
        <p className="text-xs text-slate-400">
          Immutable audit record of all brand onboardings, knowledge ingestions, AI runs, approvals, and publishing events.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs">Loading audit events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">No audit events recorded yet.</div>
        ) : (
          <div className="relative border-l border-slate-800 ml-4 space-y-6">
            {events.map((event) => {
              const badge = getActionBadge(event.action);
              const Icon = badge.icon;

              return (
                <div key={event.id} className="relative pl-6 space-y-1">
                  <div className="absolute -left-3 top-0.5 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-indigo-400">
                    <Icon className="w-3 h-3" />
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${badge.color}`}>
                      {event.action}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(event.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-white">{event.details}</p>

                  <div className="text-[11px] text-slate-400 flex items-center gap-3">
                    {event.user && <span>Actor: <strong>{event.user.name}</strong></span>}
                    {event.brand && <span>Brand: <strong>{event.brand.name}</strong></span>}
                    {event.campaign && <span>Campaign: <strong>{event.campaign.name}</strong></span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

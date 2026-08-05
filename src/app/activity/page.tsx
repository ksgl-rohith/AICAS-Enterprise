'use client';

import React, { useEffect, useState } from 'react';
import { History, Building2, Megaphone, CheckCircle2, Send, FileText, Layers } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Badge, BadgeVariant } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';

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

  const getActionBadge = (action: string): { variant: BadgeVariant; icon: any } => {
    switch (action) {
      case 'BRAND_CREATED':
        return { variant: 'purple', icon: Building2 };
      case 'DOCUMENT_UPLOADED':
        return { variant: 'indigo', icon: FileText };
      case 'CAMPAIGN_CREATED':
      case 'STRATEGY_GENERATED':
        return { variant: 'blue', icon: Megaphone };
      case 'CONTENT_GENERATED':
        return { variant: 'purple', icon: Layers };
      case 'APPROVED':
      case 'REVIEW_PASSED':
        return { variant: 'emerald', icon: CheckCircle2 };
      case 'PUBLISHED_SIMULATED':
      case 'PUBLISHED_LIVE':
        return { variant: 'emerald', icon: Send };
      default:
        return { variant: 'slate', icon: History };
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Governance & Audit"
        title="System Audit & Lineage Timeline"
        description="Immutable audit record of all brand onboardings, knowledge ingestions, AI runs, approvals, and publishing events."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Governance' },
          { label: 'Audit Timeline' },
        ]}
      />

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {loading ? (
          <div className="text-center py-16 text-slate-500 text-xs">Loading audit events...</div>
        ) : events.length === 0 ? (
          <EmptyState
            icon={History}
            title="No Audit Events Yet"
            description="Audit logs will record automatically as system actions and campaigns execute."
          />
        ) : (
          <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 space-y-6">
            {events.map((event) => {
              const badge = getActionBadge(event.action);
              const Icon = badge.icon;

              return (
                <div key={event.id} className="relative pl-6 space-y-1">
                  <div className="absolute -left-3 top-0.5 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
                    <Icon className="w-3 h-3" />
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant={badge.variant}>{event.action}</Badge>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {new Date(event.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{event.details}</p>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3">
                    {event.user && <span>Actor: <strong className="text-slate-700 dark:text-slate-300">{event.user.name}</strong></span>}
                    {event.brand && <span>Brand: <strong className="text-slate-700 dark:text-slate-300">{event.brand.name}</strong></span>}
                    {event.campaign && <span>Campaign: <strong className="text-slate-700 dark:text-slate-300">{event.campaign.name}</strong></span>}
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

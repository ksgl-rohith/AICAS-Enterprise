'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Megaphone,
  Sparkles,
  Layers,
  CheckCircle2,
  CalendarDays,
  Radio,
  FileText,
  TrendingUp,
  FlaskConical,
  History,
  Send,
  Plus,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { CampaignLifecycleTimeline } from '@/components/campaign/campaign-lifecycle-timeline';
import { EstimatedAnalyticsCard } from '@/components/campaign/estimated-analytics-card';

export default function CampaignWorkspacePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'strategy' | 'content_plan' | 'posts' | 'approvals' | 'schedule' | 'analytics' | 'experiments' | 'audit'>('overview');
  const [approvingStrategy, setApprovingStrategy] = useState(false);

  const fetchCampaign = () => {
    fetch(`/api/campaigns/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCampaign(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCampaign();
  }, [params.id]);

  const handleApproveStrategy = async () => {
    setApprovingStrategy(true);
    try {
      const res = await fetch(`/api/campaigns/${params.id}/approve-strategy`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(`Strategy approved! Generated ${data.contentCount || 0} content items & scheduling entries.`);
        fetchCampaign();
      } else {
        alert(data.error || 'Failed to approve strategy.');
      }
    } catch {
      alert('Network error approving strategy.');
    } finally {
      setApprovingStrategy(false);
    }
  };

  if (loading || !campaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 text-xs gap-2">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading Campaign Workspace...</span>
      </div>
    );
  }

  const strategy = campaign.strategy;
  const pillars = strategy ? JSON.parse(strategy.contentPillarsJson || '[]') : [];
  const contentItems = campaign.contentItems || [];
  const schedules = campaign.schedules || [];
  const isApproved = campaign.status === 'STRATEGY_APPROVED' || campaign.status === 'SCHEDULED' || campaign.status === 'ACTIVE';

  const timelineSteps = [
    { key: 'created', label: 'Campaign Created', status: 'completed' as const },
    { key: 'strategy', label: 'Strategy Generated', status: strategy ? 'completed' as const : 'current' as const },
    { key: 'approved', label: 'Strategy Approved', status: isApproved ? 'completed' as const : strategy ? 'current' as const : 'pending' as const },
    { key: 'planning', label: 'Content Plan & Posts', status: contentItems.length > 0 ? 'completed' as const : 'pending' as const },
    { key: 'scheduled', label: 'Scheduling & Calendar', status: schedules.length > 0 ? 'completed' as const : 'pending' as const },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        eyebrow={`Campaign Operations • ${campaign.brand?.name || 'Brand'}`}
        title={campaign.name}
        description={`Targeting ${campaign.targetAudience} across ${campaign.channels.replace(/,/g, ', ')}.`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Campaigns', href: '/campaigns' },
          { label: campaign.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {!isApproved ? (
              <button
                onClick={handleApproveStrategy}
                disabled={approvingStrategy || !strategy}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm shadow-emerald-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{approvingStrategy ? 'Approving & Planning...' : 'Approve Strategy & Generate Content'}</span>
              </button>
            ) : (
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> STRATEGY APPROVED
              </span>
            )}

            <Link
              href={`/campaigns/${campaign.id}/strategy`}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-sm shadow-purple-600/30 flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Strategy Studio</span>
            </Link>
          </div>
        }
      />

      <CampaignLifecycleTimeline steps={timelineSteps} />

      {/* Workspace Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
        {[
          { id: 'overview', label: 'Overview', icon: Megaphone },
          { id: 'strategy', label: 'Strategy', icon: Sparkles },
          { id: 'content_plan', label: 'Content Plan', icon: FileText },
          { id: 'posts', label: `Posts (${contentItems.length})`, icon: Layers },
          { id: 'approvals', label: 'Approvals', icon: CheckCircle2 },
          { id: 'schedule', label: `Schedule (${schedules.length})`, icon: CalendarDays },
          { id: 'analytics', label: 'Analytics & Forecast', icon: TrendingUp },
          { id: 'experiments', label: 'Experiments', icon: FlaskConical },
          { id: 'audit', label: 'Audit Log', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 shrink-0 transition-all ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Action Required Banner */}
          {!isApproved && (
            <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-purple-900 dark:text-purple-200 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" /> Action Required: Review & Approve Strategy
                </span>
                <p className="text-purple-700 dark:text-purple-300">
                  StrategyAgent has generated campaign pillars. Approve strategy below to automatically run Content Planning and scheduling.
                </p>
              </div>
              <button
                onClick={handleApproveStrategy}
                disabled={approvingStrategy || !strategy}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-sm hover:bg-purple-500 shrink-0"
              >
                {approvingStrategy ? 'Approving...' : 'Approve Strategy Now'}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" /> Master Strategy Narrative
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "{strategy?.campaignNarrative || 'No strategy narrative generated yet.'}"
              </p>
              <div className="pt-2">
                <Link
                  href={`/campaigns/${campaign.id}/strategy`}
                  className="text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-1"
                >
                  View Full Strategy Workspace & Pillars &rarr;
                </Link>
              </div>
            </div>

            <EstimatedAnalyticsCard />
          </div>
        </div>
      )}

      {/* Strategy Tab */}
      {activeTab === 'strategy' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Strategic Content Pillars ({pillars.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pillars.map((p: any, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white">{p.name}</h4>
                <p className="text-indigo-600 dark:text-indigo-300 font-semibold">Angle: {p.angle}</p>
                <p className="text-slate-600 dark:text-slate-400">{p.rationale}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts Tab */}
      {(activeTab === 'posts' || activeTab === 'content_plan') && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Generated Content Items ({contentItems.length})
            </h3>
            <Link href={`/campaigns/${campaign.id}/content`} className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Open Content Studio &rarr;
            </Link>
          </div>

          {contentItems.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">No posts generated yet. Approve strategy to generate posts automatically.</div>
          ) : (
            <div className="space-y-3">
              {contentItems.map((item: any) => (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="text-[11px] text-slate-500">Pillar: {item.contentPillar} • Format: {item.format}</p>
                  </div>
                  <Badge variant="indigo">{item.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-indigo-500" /> Scheduled Posts Queue ({schedules.length})
            </h3>
            <Link href="/calendar" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Open Calendar Page &rarr;
            </Link>
          </div>

          {schedules.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">No scheduled posts in queue.</div>
          ) : (
            <div className="space-y-3">
              {schedules.map((s: any) => (
                <div key={s.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">{s.contentItem?.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      Channel: <strong className="uppercase">{s.channel}</strong> • Time: {new Date(s.scheduledTime).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={s.status === 'PUBLISHED' ? 'emerald' : 'amber'}>{s.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

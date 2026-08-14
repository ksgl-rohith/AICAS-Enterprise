'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, Sparkles, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { MetricCard } from '@/components/ui/metric-card';
import { Badge } from '@/components/ui/badge';
import { useWorkspace } from '@/components/workspace-context';

export default function AnalyticsPage() {
  const { activeWorkspace } = useWorkspace();
  const [data, setData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [modeFilter, setModeFilter] = useState<'all' | 'real' | 'simulated'>('all');
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [generatingRec, setGeneratingRec] = useState(false);

  const fetchAnalytics = (wsId?: string) => {
    setLoading(true);
    const targetWs = wsId || activeWorkspace?.id || 'tenant-default';
    fetch(`/api/analytics?workspaceId=${targetWs}&mode=${modeFilter}`)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchRecommendations = () => {
    fetch('/api/recommendations')
      .then((res) => res.json())
      .then((recData) => {
        setRecommendations(Array.isArray(recData) ? recData : []);
      });
  };

  useEffect(() => {
    fetchAnalytics(activeWorkspace?.id);
    fetchRecommendations();

    const handleWorkspaceChanged = (e: any) => {
      fetchAnalytics(e.detail?.workspaceId);
    };

    window.addEventListener('workspace-changed', handleWorkspaceChanged);
    return () => {
      window.removeEventListener('workspace-changed', handleWorkspaceChanged);
    };
  }, [modeFilter, activeWorkspace?.id]);

  const handleSimulateMetrics = async () => {
    setSimulating(true);
    try {
      const res = await fetch('/api/analytics/simulate-performance', { method: 'POST' });
      if (res.ok) {
        fetchAnalytics(activeWorkspace?.id);
      }
    } catch {
      alert('Error simulating performance.');
    } finally {
      setSimulating(false);
    }
  };

  const handleGenerateRecommendation = async () => {
    setGeneratingRec(true);
    try {
      const res = await fetch('/api/recommendations', { method: 'POST' });
      if (res.ok) {
        fetchRecommendations();
      }
    } catch {
      alert('Error running OptimizationAgent.');
    } finally {
      setGeneratingRec(false);
    }
  };

  const summary = data?.summary || {};
  const channelBreakdown = data?.channelBreakdown || {};
  const latestRec = recommendations[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Workspace: ${activeWorkspace?.name || 'Enterprise'}`}
        title="Analytics & Optimization Dashboard"
        description="Normalized social post engagement metrics, attribution analysis, and AI strategic next-post recommendations."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Intelligence & Growth' },
          { label: 'Analytics & Growth' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              {(['all', 'real', 'simulated'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setModeFilter(mode)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-all ${
                    modeFilter === mode
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <button
              onClick={handleSimulateMetrics}
              disabled={simulating}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
              <span>Simulate 7-Day Performance</span>
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Impressions"
          value={(summary.totalImpressions || 0).toLocaleString()}
          subtitle="Cross-channel reach"
          icon={BarChart3}
          trend={summary.totalImpressions > 0 ? '+18.4%' : 'No data'}
          trendPositive={summary.totalImpressions > 0}
          loading={loading}
        />
        <MetricCard
          title="Total Engagements"
          value={(summary.totalEngagements || 0).toLocaleString()}
          subtitle={`Avg Rate: ${summary.avgEngagementRate || '0.00'}%`}
          icon={BarChart3}
          iconColor="text-purple-500"
          loading={loading}
        />
        <MetricCard
          title="Clicks & CTR"
          value={(summary.totalClicks || 0).toLocaleString()}
          subtitle={`Avg CTR: ${summary.avgCTR || '0.00'}%`}
          icon={BarChart3}
          iconColor="text-indigo-500"
          loading={loading}
        />
        <MetricCard
          title="Conversions & Leads"
          value={(summary.totalConversions || 0).toLocaleString()}
          subtitle="Attributed campaign CTAs"
          icon={BarChart3}
          iconColor="text-emerald-500"
          loading={loading}
        />
      </div>

      {/* AI Strategic Next-Post Recommendation Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">AI Optimization & Next-Post Recommendation</h2>
            <Badge variant="purple">OptimizationAgent</Badge>
          </div>

          <button
            onClick={handleGenerateRecommendation}
            disabled={generatingRec}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-purple-600/30 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generatingRec ? 'animate-spin' : ''}`} />
            <span>Generate New Recommendation</span>
          </button>
        </div>

        {!latestRec ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">Click "Generate New Recommendation" to run OptimizationAgent over metrics.</p>
        ) : (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-semibold">Recommended Channel</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase block text-sm">{latestRec.targetChannel}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-semibold">Highest-Performing Pillar</span>
                <span className="text-slate-900 dark:text-white font-bold block truncate">{latestRec.bestPillar}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-semibold">Optimal Posting Window</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold block">{latestRec.postingWindow}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <strong className="text-slate-900 dark:text-white block font-semibold">Recommended Topic Idea: "{latestRec.recommendedTopic}"</strong>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{latestRec.explanation}</p>
            </div>
          </div>
        )}
      </div>

      {/* Channel Breakdown Grid */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Channel Metrics Breakdown for {activeWorkspace?.name}
        </h2>

        {Object.keys(channelBreakdown).length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs">
            No channel metric snapshots available for {activeWorkspace?.name}. Click "Simulate 7-Day Performance" to populate test snapshots.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {Object.entries(channelBreakdown).map(([ch, stats]: [string, any]) => (
              <div key={ch} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="font-bold text-slate-900 dark:text-white uppercase">{ch}</span>
                  <Badge variant="indigo">Channel</Badge>
                </div>
                <div className="space-y-1 text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Impressions:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{(stats.impressions || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Engagements:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{(stats.engagements || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Clicks:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{(stats.clicks || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

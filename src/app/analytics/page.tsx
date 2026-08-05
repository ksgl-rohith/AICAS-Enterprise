'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Sparkles, Filter, RefreshCw, Radio, Layers, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [modeFilter, setModeFilter] = useState<'all' | 'real' | 'simulated'>('all');
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [generatingRec, setGeneratingRec] = useState(false);

  const fetchAnalytics = () => {
    fetch(`/api/analytics?mode=${modeFilter}`)
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
    fetchAnalytics();
    fetchRecommendations();
  }, [modeFilter]);

  const handleSimulateMetrics = async () => {
    setSimulating(true);
    try {
      const res = await fetch('/api/analytics/simulate-performance', { method: 'POST' });
      if (res.ok) {
        fetchAnalytics();
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
  const pillarBreakdown = data?.pillarBreakdown || {};
  const latestRec = recommendations[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Analytics & Optimization Dashboard</h1>
          <p className="text-xs text-slate-400">
            Normalized social post engagement metrics, attribution analysis, and AI strategic next-post recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            {(['all', 'real', 'simulated'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setModeFilter(mode)}
                className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-all ${
                  modeFilter === mode ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={handleSimulateMetrics}
            disabled={simulating}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
            <span>Simulate 7-Day Performance</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Impressions</span>
          <div className="text-2xl font-bold text-white">{(summary.totalImpressions || 0).toLocaleString()}</div>
          <span className="text-[10px] text-emerald-400 font-semibold">+18.4% vs prior period</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Engagements</span>
          <div className="text-2xl font-bold text-purple-400">{(summary.totalEngagements || 0).toLocaleString()}</div>
          <span className="text-[10px] text-purple-400 font-semibold">Avg Rate: {summary.avgEngagementRate || '0.00'}%</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Clicks & CTR</span>
          <div className="text-2xl font-bold text-indigo-400">{(summary.totalClicks || 0).toLocaleString()}</div>
          <span className="text-[10px] text-indigo-400 font-semibold">Avg CTR: {summary.avgCTR || '0.00'}%</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Conversions & Leads</span>
          <div className="text-2xl font-bold text-emerald-400">{(summary.totalConversions || 0).toLocaleString()}</div>
          <span className="text-[10px] text-slate-400 font-medium">Attributed to campaign CTAs</span>
        </div>
      </div>

      {/* AI Strategic Next-Post Recommendation Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/30 via-slate-900 to-indigo-900/30 border border-purple-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">AI Optimization & Next-Post Recommendation</h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              OptimizationAgent
            </span>
          </div>

          <button
            onClick={handleGenerateRecommendation}
            disabled={generatingRec}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generatingRec ? 'animate-spin' : ''}`} />
            <span>Generate New Recommendation</span>
          </button>
        </div>

        {!latestRec ? (
          <p className="text-xs text-slate-400">Click "Generate New Recommendation" to run OptimizationAgent over metrics.</p>
        ) : (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Recommended Channel</span>
                <span className="text-indigo-400 font-bold uppercase block text-sm">{latestRec.targetChannel}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Highest-Performing Pillar</span>
                <span className="text-white font-bold block truncate">{latestRec.bestPillar}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Optimal Posting Window</span>
                <span className="text-emerald-400 font-bold block">{latestRec.postingWindow}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1">
              <strong className="text-white block font-semibold">Recommended Topic Idea: "{latestRec.recommendedTopic}"</strong>
              <p className="text-slate-300 leading-relaxed">{latestRec.explanation}</p>
            </div>
          </div>
        )}
      </div>

      {/* Channel Breakdown Grid */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-400" /> Channel Metrics Breakdown
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {Object.entries(channelBreakdown).map(([ch, stats]: [string, any]) => (
            <div key={ch} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white uppercase">{ch}</span>
                <span className="text-[10px] text-indigo-400 font-mono">Channel</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Impressions:</span>
                  <span className="font-bold text-white">{(stats.impressions || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Engagements:</span>
                  <span className="font-bold text-purple-400">{(stats.engagements || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Clicks:</span>
                  <span className="font-bold text-indigo-400">{(stats.clicks || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { BarChart3, TrendingUp, MousePointer, DollarSign, Sparkles } from 'lucide-react';

export function AnalyticsShowcaseSection() {
  const chartData = [
    { day: 'Mon', val: 40, reach: '14.2k', channel: 'LinkedIn' },
    { day: 'Tue', val: 55, reach: '22.8k', channel: 'LinkedIn + IG' },
    { day: 'Wed', val: 72, reach: '34.5k', channel: 'Multi-Channel' },
    { day: 'Thu', val: 64, reach: '29.1k', channel: 'Instagram' },
    { day: 'Fri', val: 88, reach: '42.6k', channel: 'LinkedIn' },
    { day: 'Sat', val: 76, reach: '36.8k', channel: 'Telegram' },
    { day: 'Sun', val: 95, reach: '48.9k', channel: 'Multi-Channel' },
  ];

  return (
    <section className="py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/80 rounded-3xl my-6 transition-colors duration-200">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-4">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analytics & Attribution Engine</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
          Normalized Social Metrics & Causal Insights
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
          Aggregates performance data across connected APIs into unified metrics tables, 7-day metric simulation curves, and ROI attribution dashboards.
        </p>
      </div>

      {/* Analytics Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* KPI Card 1 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Impressions</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">412,850</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-2 flex items-center gap-1">
            ▲ +34.2% vs previous 30 days
          </div>
        </div>

        {/* KPI Card 2 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Avg Click-Through Rate</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <MousePointer className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">4.82%</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-2 flex items-center gap-1">
            ▲ +1.4% industry benchmark
          </div>
        </div>

        {/* KPI Card 3 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Campaign ROI Attribution</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">384%</div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-2">
            Cost Efficiency: $0.18 CPO (Cost per Organic Engagement)
          </div>
        </div>
      </div>

      {/* Detailed Visual Bar Chart Section */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-indigo-950/20 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Cross-Platform Daily Impressions & Reach (7-Day Active Curve)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Normalized metrics across LinkedIn, Facebook Pages, Instagram Business, and Telegram Bot APIs</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold self-start md:self-auto">
            Live Metric Simulator
          </span>
        </div>

        {/* Fully Visible High-Contrast Bar Graph Component */}
        <div className="bg-slate-50 dark:bg-slate-950/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="h-64 w-full flex items-end justify-between gap-2 sm:gap-4 relative pt-8 pb-2">
            {/* Grid Line Markers */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-mono text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="border-b border-slate-200/80 dark:border-slate-800/80 w-full flex justify-between pr-2"><span>50,000</span></div>
              <div className="border-b border-slate-200/80 dark:border-slate-800/80 w-full flex justify-between pr-2"><span>37,500</span></div>
              <div className="border-b border-slate-200/80 dark:border-slate-800/80 w-full flex justify-between pr-2"><span>25,000</span></div>
              <div className="border-b border-slate-200/80 dark:border-slate-800/80 w-full flex justify-between pr-2"><span>12,500</span></div>
              <div className="w-full flex justify-between pr-2"><span>0</span></div>
            </div>

            {/* Render Vertical Bars */}
            {chartData.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center h-full justify-end z-10 group cursor-pointer">
                {/* Value Pill above bar */}
                <div className="text-[11px] font-mono font-extrabold text-indigo-900 dark:text-indigo-200 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 shadow-xs mb-2 transition-transform group-hover:scale-110">
                  {bar.reach}
                </div>

                {/* Track and Animated Bar Fill */}
                <div className="w-full max-w-[48px] h-48 bg-slate-200/60 dark:bg-slate-800/60 rounded-t-xl overflow-hidden flex items-end p-0.5">
                  <div
                    style={{ height: `${bar.val}%` }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 via-indigo-500 to-purple-600 shadow-md shadow-indigo-600/30 group-hover:from-indigo-700 group-hover:to-purple-700 transition-all duration-300"
                  />
                </div>

                {/* Day Label */}
                <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-2">
                  {bar.day}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 font-medium block mb-1">Audience Sentiment</span>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">84%</span>
              <span className="text-[11px] text-slate-800 dark:text-slate-200 font-bold">Positive / Enthusiastic</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 font-medium block mb-1">Neutral Sentiment</span>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">12%</span>
              <span className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">Informational Inquiries</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 font-medium block mb-1">Negative / Risk Flags</span>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">4%</span>
              <span className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">Flagged by Community Inbox</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

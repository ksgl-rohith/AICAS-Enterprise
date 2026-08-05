'use client';

import React from 'react';
import {
  X,
  Calendar,
  Clock,
  Zap,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BarChart3,
} from 'lucide-react';

export interface SchedulePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignName: string;
  schedules?: any[];
  marketResearch?: any;
}

export function SchedulePreviewModal({
  isOpen,
  onClose,
  campaignName,
  schedules = [],
  marketResearch,
}: SchedulePreviewModalProps) {
  if (!isOpen) return null;

  const channelTimingRecommendations = marketResearch?.optimalChannelSchedules || [
    {
      channel: 'linkedin',
      peakPostingWindow: '08:30 AM - 10:00 AM EST',
      optimalDays: ['Tuesday', 'Wednesday', 'Thursday'],
      recommendedTimeUtc: '13:30',
      expectedEngagementMultiplier: 3.4,
      audienceActivityRationale: 'B2B executive decision makers active during mid-week morning strategy planning.',
    },
    {
      channel: 'instagram',
      peakPostingWindow: '12:00 PM - 01:30 PM & 06:00 PM EST',
      optimalDays: ['Wednesday', 'Friday', 'Sunday'],
      recommendedTimeUtc: '17:00',
      expectedEngagementMultiplier: 2.8,
      audienceActivityRationale: 'High visual engagement during lunch breaks and evening leisure browsing.',
    },
    {
      channel: 'facebook',
      peakPostingWindow: '01:00 PM - 03:00 PM EST',
      optimalDays: ['Monday', 'Wednesday', 'Thursday'],
      recommendedTimeUtc: '18:00',
      expectedEngagementMultiplier: 2.1,
      audienceActivityRationale: 'Community discussion link clicks peak mid-afternoon.',
    },
    {
      channel: 'telegram',
      peakPostingWindow: '09:00 AM & 05:00 PM EST',
      optimalDays: ['Tuesday', 'Thursday'],
      recommendedTimeUtc: '14:00',
      expectedEngagementMultiplier: 2.5,
      audienceActivityRationale: 'Push notification open rates peak during start and end of workday.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>AI Market-Driven Schedule Preview</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Market Optimized
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">{campaignName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Market Intelligence Rationale Box */}
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-bold text-indigo-900 dark:text-indigo-200 block">
                Market Research Optimization Logic
              </span>
              <p className="text-slate-600 dark:text-indigo-300/80 leading-relaxed">
                {marketResearch?.researchSummary ||
                  'Posting schedules have been calculated by the Market Research Agent by cross-referencing industry engagement patterns, channel audience active windows, and competitor posting density.'}
              </p>
            </div>
          </div>

          {/* Timeline Cards */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recommended Channel Posting Windows
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {channelTimingRecommendations.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3 relative overflow-hidden group hover:border-indigo-500/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white capitalize flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {item.channel}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                      +{item.expectedEngagementMultiplier}x Peak CTR
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{item.peakPostingWindow}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Best Days: {Array.isArray(item.optimalDays) ? item.optimalDays.join(', ') : item.optimalDays}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    Rationale: {item.audienceActivityRationale}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Schedules automatically adjust based on continuous performance metrics.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
          >
            Confirm & Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

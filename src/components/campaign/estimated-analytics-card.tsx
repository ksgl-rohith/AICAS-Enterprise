'use client';

import React from 'react';
import { TrendingUp, BarChart2, Info, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface PerformanceForecastData {
  predictedMetrics: {
    impressions?: { estimate: number; lowerBound: number; upperBound: number; confidence: string };
    engagementRate?: { estimate: number; lowerBound: number; upperBound: number; confidence: string };
    ctr?: { estimate: number; lowerBound: number; upperBound: number; confidence: string };
  };
  dataSufficiency: string;
  confidence: string;
  factors: string[];
  sampleSize?: number;
}

export function EstimatedAnalyticsCard({ forecast }: { forecast?: PerformanceForecastData }) {
  if (!forecast) {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-1">
        <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          <span>Performance Forecast</span>
        </div>
        <p>No historical post data available yet to compute confidence intervals.</p>
      </div>
    );
  }

  const isColdStart = forecast.dataSufficiency === 'ColdStart' || forecast.dataSufficiency === 'Sparse';
  const imp = forecast.predictedMetrics?.impressions;
  const eng = forecast.predictedMetrics?.engagementRate;

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
            Estimated Performance Analytics
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isColdStart ? 'amber' : 'emerald'}>
            Confidence: {forecast.confidence || 'Medium'}
          </Badge>
          <span className="text-[10px] text-slate-400 font-mono">
            {isColdStart ? 'Cold-Start Baseline' : `Sample: ${forecast.sampleSize || 30} posts`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {imp && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Estimated Impressions</span>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                {imp.estimate.toLocaleString()}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                ({imp.lowerBound.toLocaleString()} – {imp.upperBound.toLocaleString()})
              </span>
            </div>
          </div>
        )}

        {eng && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Estimated Engagement Rate</span>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                {(eng.estimate * 100).toFixed(2)}%
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                ({(eng.lowerBound * 100).toFixed(1)}% – {(eng.upperBound * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        )}
      </div>

      {forecast.factors && forecast.factors.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Info className="w-3 h-3 text-indigo-400" /> Key Prediction Drivers ("Why this estimate?")
          </span>
          <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
            {forecast.factors.map((factor, idx) => (
              <li key={idx} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { CheckCircle2, Clock, PlayCircle, AlertTriangle } from 'lucide-react';

export interface CampaignTimelineStep {
  key: string;
  label: string;
  status: 'completed' | 'current' | 'pending' | 'failed';
  timestamp?: string;
  details?: string;
}

export function CampaignLifecycleTimeline({ steps }: { steps: CampaignTimelineStep[] }) {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2 sm:gap-4">
        {steps.map((step, idx) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isFailed = step.status === 'failed';

          return (
            <React.Fragment key={step.key}>
              <div className="flex items-center gap-2 shrink-0">
                {isCompleted ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                ) : isCurrent ? (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs animate-pulse">
                    <PlayCircle className="w-3.5 h-3.5" />
                  </div>
                ) : isFailed ? (
                  <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-xs border border-red-500/30">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs border border-slate-200 dark:border-slate-700">
                    <Clock className="w-3 h-3" />
                  </div>
                )}

                <div>
                  <span
                    className={`text-xs font-bold block ${
                      isCompleted
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : isCurrent
                        ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.timestamp && (
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 min-w-[20px] flex-1 ${
                    isCompleted ? 'bg-emerald-500' : isCurrent ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                ></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

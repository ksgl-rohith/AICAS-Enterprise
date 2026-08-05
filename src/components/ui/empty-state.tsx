'use client';

import React from 'react';
import { LucideIcon, FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`p-8 md:p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl mx-auto my-6 space-y-4 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700/60 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400 shadow-sm">
        <Icon className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
          {description}
        </p>
      </div>

      {(action || secondaryAction) && (
        <div className="flex items-center justify-center gap-3 pt-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

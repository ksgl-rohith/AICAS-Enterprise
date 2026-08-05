'use client';

import React from 'react';
import { LucideIcon, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: string;
  trendPositive?: boolean;
  href?: string;
  hrefLabel?: string;
  loading?: boolean;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-indigo-500',
  trend,
  trendPositive = true,
  href,
  hrefLabel,
  loading = false,
}: MetricCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{title}</span>
        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center">
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
          {loading ? '...' : value}
        </div>

        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trendPositive
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-500/20'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
        <span>{subtitle}</span>
        {href && (
          <Link
            href={href}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium inline-flex items-center gap-0.5"
          >
            {hrefLabel || 'View details'} <ArrowUpRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

'use client';

import React from 'react';

export type BadgeVariant = 'indigo' | 'purple' | 'emerald' | 'amber' | 'red' | 'slate' | 'blue';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  indigo: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
  purple: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
  amber: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
  red: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60',
  slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  blue: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
};

export function Badge({
  children,
  variant = 'slate',
  size = 'md',
  icon,
  className = '',
}: BadgeProps) {
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border ${variantStyles[variant]} ${sizeStyles} ${className}`}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
}

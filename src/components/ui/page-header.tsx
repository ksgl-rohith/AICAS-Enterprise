'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  actions,
  children,
}: PageHeaderProps) {
  return (
    <div className="mb-6 space-y-3 pb-5 border-b border-slate-200 dark:border-slate-800">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />}
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          {eyebrow && (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                {eyebrow}
              </span>
            </div>
          )}
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Action Controls */}
        {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
      </div>

      {children}
    </div>
  );
}

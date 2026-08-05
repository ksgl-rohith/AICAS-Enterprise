'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Megaphone,
  CheckCircle2,
  CalendarDays,
  BarChart3,
  History,
  Settings,
  Bot,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Brand Profiles', href: '/brands', icon: Building2 },
  { name: 'Campaign Wizard', href: '/campaigns', icon: Megaphone },
  { name: 'Approval Queue', href: '/approvals', icon: CheckCircle2, badge: 'Review' },
  { name: 'Calendar & Schedule', href: '/calendar', icon: CalendarDays },
  { name: 'Analytics & Growth', href: '/analytics', icon: BarChart3 },
  { name: 'Audit Timeline', href: '/activity', icon: History },
  { name: 'Platform Integrations', href: '/settings/integrations', icon: Settings, highlight: true },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex flex-col h-screen sticky top-0 shrink-0 select-none z-30">
      {/* Brand & App Logo */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base">AICAS</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              Lite
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Multi-Agent Content OS</p>
        </div>
      </div>

      {/* Active Brand Context Pill */}
      <div className="px-3 py-3 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 px-2 mb-1">
          Active Workspace Brand
        </div>
        <div className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              ApexAI Solutions
            </span>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && !isActive && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  {item.badge}
                </span>
              )}
              {item.highlight && !isActive && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* System Status Footprint */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <div className="truncate">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">
              Engine Guardrails Active
            </span>
            <span className="text-[10px] text-slate-400">RAG + Review Council</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

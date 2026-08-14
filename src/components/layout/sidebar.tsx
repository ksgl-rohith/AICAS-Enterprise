'use client';

import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  FlaskConical,
  DollarSign,
  AlertTriangle,
  MessageSquare,
  Globe,
  Video,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LucideIcon,
  SlidersHorizontal,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  highlight?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Workspace',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Brand Profiles', href: '/brands', icon: Building2 },
    ],
  },
  {
    title: 'Campaign Operations',
    items: [
      { name: 'Campaign Wizard', href: '/campaigns', icon: Megaphone },
      { name: 'Approval Queue', href: '/approvals', icon: CheckCircle2, badge: 'Review' },
      { name: 'Calendar & Schedule', href: '/calendar', icon: CalendarDays },
    ],
  },
  {
    title: 'Intelligence & Growth',
    items: [
      { name: 'Analytics & Growth', href: '/analytics', icon: BarChart3 },
      { name: 'Experiments & A/B', href: '/experiments', icon: FlaskConical },
      { name: 'Recommendations', href: '/recommendations', icon: Sparkles },
      { name: 'Fatigue & Decay', href: '/fatigue', icon: AlertTriangle },
    ],
  },
  {
    title: 'Content Operations',
    items: [
      { name: 'Community Inbox', href: '/community', icon: MessageSquare },
      { name: 'Localization', href: '/localization', icon: Globe },
      { name: 'Video Packages', href: '/video', icon: Video },
    ],
  },
  {
    title: 'Governance',
    items: [
      { name: 'Cost Governance', href: '/cost-governance', icon: DollarSign },
      { name: 'Controlled Autonomy', href: '/autonomy', icon: Sliders },
      { name: 'Audit Timeline', href: '/activity', icon: History },
    ],
  },
  {
    title: 'Administration',
    items: [
      { name: 'Admin Preferences', href: '/settings/preferences', icon: SlidersHorizontal },
      { name: 'Platform Integrations', href: '/settings/integrations', icon: Settings, highlight: true },
    ],
  },
];

import { useWorkspace } from '@/components/workspace-context';

export function Sidebar() {
  const pathname = usePathname();
  const { activeWorkspace } = useWorkspace();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('aicas_sidebar_collapsed');
      if (saved !== null) {
        setCollapsed(saved === 'true');
      }
    } catch {
      // localStorage fallback
    }
    setIsLoaded(true);
  }, []);

  const toggleCollapsed = () => {
    const nextState = !collapsed;
    setCollapsed(nextState);
    try {
      localStorage.setItem('aicas_sidebar_collapsed', String(nextState));
    } catch {
      // ignore
    }
  };

  return (
    <>
      {/* Mobile Menu Trigger */}
      <div className="lg:hidden fixed top-3 left-4 z-40">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
        />
      )}

      {/* Main Sidebar */}
      <aside
        aria-label="Main Navigation"
        className={`fixed lg:sticky top-0 h-screen z-40 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-all duration-200 ease-in-out shrink-0 select-none ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Unified Brand Header Component */}
        <div className="h-16 px-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <Link
            href="/dashboard"
            title="AICAS Enterprise Content OS"
            className={`flex items-center gap-2.5 overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl p-1 transition-opacity ${
              collapsed ? 'justify-center w-full' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-bold text-slate-900 dark:text-white tracking-tight text-sm truncate">
                    AICAS Enterprise
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                  Enterprise Content OS
                </p>
              </div>
            )}
          </Link>

          {!collapsed && (
            <button
              onClick={toggleCollapsed}
              aria-label="Collapse Sidebar"
              aria-expanded={!collapsed}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed Expand Toggle */}
        {collapsed && (
          <div className="hidden lg:flex justify-center py-2 border-b border-slate-100 dark:border-slate-800/60">
            <button
              onClick={toggleCollapsed}
              aria-label="Expand Sidebar"
              aria-expanded={!collapsed}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Active Workspace Indicator */}
        {!collapsed && (
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-950/40">
            <div className="text-[9px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 px-1 mb-1">
              Active Workspace
            </div>
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/70 shadow-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {activeWorkspace?.name || 'ApexAI Enterprise'}
                </span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              {!collapsed && (
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.name : undefined}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/20'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      />
                      {!collapsed && <span className="truncate">{item.name}</span>}
                    </div>

                    {!collapsed && item.badge && !isActive && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 shrink-0">
                        {item.badge}
                      </span>
                    )}

                    {!collapsed && item.highlight && !isActive && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Status */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            {!collapsed && (
              <div className="truncate">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">
                  Controlled Autonomy
                </span>
                <span className="text-[10px] text-slate-400">Governance Active</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

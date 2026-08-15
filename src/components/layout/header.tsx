'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sun,
  Moon,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Bot,
  SlidersHorizontal,
  Settings,
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { useAuth } from '@/components/auth-context';
import { WorkspaceSwitcher } from '@/components/layout/workspace-switcher';
import { AiEnginePopover } from '@/components/layout/ai-engine-popover';
import { PublishingControlPopover } from '@/components/layout/publishing-control-popover';

export function Header() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, isAdmin, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
      {/* Active Workspace Switcher & Title */}
      <div className="flex items-center gap-3 pl-12 lg:pl-0">
        <WorkspaceSwitcher />

        <div className="hidden lg:block border-l border-slate-200 dark:border-slate-800 pl-3">
          <h1 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Enterprise Content Studio</span>
          </h1>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            Multi-Agent Campaign Orchestration & Governance
          </p>
        </div>
      </div>

      {/* Right Navbar Controls Group */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Interactive AI Engine Mode Control */}
        <div>
          <AiEnginePopover />
        </div>

        {/* Governed Publishing Mode Control */}
        <div className="hidden sm:block">
          <PublishingControlPopover />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* User Profile & Account Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            aria-expanded={userDropdownOpen}
            aria-label="User Account Menu"
            className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg py-1 px-1"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm uppercase shrink-0">
              {user?.name ? user.name.slice(0, 2) : 'US'}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block leading-tight truncate max-w-[110px]">
                {user?.name || 'User Account'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block leading-none capitalize">
                {user?.role ? user.role.replace(/_/g, ' ') : 'Member'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block shrink-0" />
          </button>

          {/* Account Dropdown Menu */}
          {userDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150"
              onMouseLeave={() => setUserDropdownOpen(false)}
            >
              <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
                {user?.email && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                )}
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold text-[10px] uppercase border border-purple-200 dark:border-purple-800/60">
                  <ShieldCheck className="w-3 h-3 text-purple-500" />
                  <span>{user?.role || 'MEMBER'}</span>
                </div>
              </div>

              <div className="py-1">
                {isAdmin && (
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      router.push('/settings/preferences');
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 flex items-center gap-2.5 font-medium transition-colors"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
                    <span>Admin Preferences</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    router.push('/settings/integrations');
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 flex items-center gap-2.5 font-medium transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Workspace Settings</span>
                </button>

                <button
                  onClick={() => {
                    toggleTheme();
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 flex items-center justify-between font-medium transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                    <span>Theme</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">{theme}</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center gap-2.5 font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

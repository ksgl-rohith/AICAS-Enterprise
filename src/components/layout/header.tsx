'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Radio,
  SlidersHorizontal,
  Sun,
  Moon,
  ShieldAlert,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { useAuth } from '@/components/auth-context';
import { AdminPreferencesModal } from '@/components/ui/admin-preferences-modal';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAdmin, logout } = useAuth();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [config, setConfig] = useState<{
    publishingMode: string;
    allowLivePublishing: boolean;
    aiMode: string;
    hasGeminiKey: boolean;
  } | null>(null);

  useEffect(() => {
    fetch('/api/integrations')
      .then((res) => res.json())
      .then((data) => {
        if (data.systemConfig) {
          setConfig(data.systemConfig);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200">
      {/* Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>Enterprise Social Operations Studio</span>
        </h1>
      </div>

      {/* Right controls: Admin Preferences, Role Badge, AI Mode, Theme Toggle, Logout */}
      <div className="flex items-center gap-3">
        {/* Role Badge & Admin Preferences Trigger */}
        {isAdmin ? (
          <button
            onClick={() => setShowAdminModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-500/20 transition-all"
            title="Click to open Admin Preferences"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>
              Role: <strong>ADMIN</strong>
            </span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium">
            <span>
              Role: <strong>{user?.role || 'USER'}</strong>
            </span>
          </div>
        )}

        {/* AI Model Engine Mode */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-slate-600 dark:text-slate-300">
            AI Engine:{' '}
            <strong className="text-indigo-600 dark:text-indigo-400">
              {config?.hasGeminiKey ? 'Gemini 2.5 Flash' : 'Mock Engine'}
            </strong>
          </span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* User Badge & Logout */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-sm uppercase">
            {user?.name ? user.name.slice(0, 2) : 'AT'}
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block leading-tight truncate max-w-[140px]">
              {user?.name || 'AICAS TEAM'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block capitalize">
              {user?.role === 'ADMIN' ? 'System Administrator' : 'Marketing Manager'}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Preferences Modal */}
      <AdminPreferencesModal isOpen={showAdminModal} onClose={() => setShowAdminModal(false)} />
    </header>
  );
}

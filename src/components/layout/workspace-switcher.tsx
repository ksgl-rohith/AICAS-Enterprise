'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Building2, ChevronDown, Check, ShieldCheck, Plus, X } from 'lucide-react';
import { useWorkspace, Workspace } from '@/components/workspace-context';

export function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, switchWorkspace, loading } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = async (wsId: string) => {
    setIsOpen(false);
    if (activeWorkspace?.id !== wsId) {
      await switchWorkspace(wsId);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Active Workspace Switcher"
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left group cursor-pointer"
      >
        <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
          {activeWorkspace?.code ? activeWorkspace.code.slice(0, 2) : 'WS'}
        </div>
        <div className="hidden sm:block text-left max-w-[140px] truncate">
          <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight truncate">
            {activeWorkspace?.name || 'Loading Workspace...'}
          </span>
          <span className="text-[9.5px] text-slate-500 dark:text-slate-400 font-mono font-medium block leading-none truncate">
            {activeWorkspace?.code || 'APEX-ENT'}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {/* Workspace Switcher Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">Authorized Workspaces</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[9px] font-mono font-bold">
              {workspaces.length} Available
            </span>
          </div>

          <div className="py-1 max-h-60 overflow-y-auto">
            {workspaces.map((ws: Workspace) => {
              const isSelected = ws.id === activeWorkspace?.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => handleSelect(ws.id)}
                  className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-100 font-semibold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {ws.code.slice(0, 2)}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold truncate leading-tight">{ws.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">{ws.role} • {ws.code}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 px-3.5">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              Switching workspaces reloads all brand context, campaign pipelines, and analytics.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

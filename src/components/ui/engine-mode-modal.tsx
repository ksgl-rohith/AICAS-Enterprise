'use client';

import React from 'react';
import { AlertTriangle, Sparkles, X } from 'lucide-react';

interface EngineModeModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function EngineModeModal({ isOpen, onConfirm, onCancel }: EngineModeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Enable REAL AI Engine Execution?</span>
          </h3>
          <button onClick={onCancel} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 space-y-1.5">
          <div className="font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Live Provider API Usage Confirmation</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Real Engine uses configured live AI providers (e.g. Gemini 2.5 Flash / OpenAI) for all agent executions and may incur API usage costs on your connected accounts.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 text-xs font-semibold">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
          >
            Stay in MOCK Mode
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
          >
            Enable REAL Engine
          </button>
        </div>
      </div>
    </div>
  );
}

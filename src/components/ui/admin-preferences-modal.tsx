'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  ShieldCheck,
  Key,
  Radio,
  Sliders,
  CheckCircle2,
  Lock,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

export interface AdminPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPreferencesModal({ isOpen, onClose }: AdminPreferencesModalProps) {
  const [executionMode, setExecutionMode] = useState<'mock' | 'real'>('mock');
  const [provider, setProvider] = useState('gemini');
  const [safetyThreshold, setSafetyThreshold] = useState('90');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings/preferences')
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setExecutionMode(data.executionMode || 'mock');
            setProvider(data.allowedAiProvider || 'gemini');
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleModeChange = (mode: 'mock' | 'real') => {
    if (mode === 'real' && executionMode === 'mock') {
      setShowConfirm(true);
    } else {
      setExecutionMode(mode);
    }
  };

  const confirmRealMode = () => {
    setExecutionMode('real');
    setShowConfirm(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await fetch('/api/settings/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          executionMode,
          allowedAiProvider: provider,
        }),
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1000);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Quick Admin Governance</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  ADMIN ONLY
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure global platform execution mode and AI provider settings.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Admin Policy banner */}
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs">
              <span className="font-bold text-indigo-900 dark:text-indigo-200 block">
                Administrator Privileges Active
              </span>
              <p className="text-slate-600 dark:text-indigo-300/80 leading-relaxed">
                Platform execution modes and AI provider governance apply across all tenant workspaces.
              </p>
            </div>
          </div>

          {/* Execution Mode */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              AI Execution Sandbox Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleModeChange('mock')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  executionMode === 'mock'
                    ? 'bg-indigo-500/10 border-indigo-500 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                }`}
              >
                <span className="text-xs font-bold text-slate-900 dark:text-white block mb-0.5">
                  Mock Mode (Sandbox)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Zero token cost mock AI generation.
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('real')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  executionMode === 'real'
                    ? 'bg-emerald-500/10 border-emerald-500 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                }`}
              >
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                  Real Provider Mode
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Live inference via LLM API keys.
                </span>
              </button>
            </div>
          </div>

          {/* AI Provider */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Allowed AI Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
            >
              <option value="gemini">Google Gemini 2.5 Flash</option>
              <option value="openai">OpenAI GPT-4o</option>
              <option value="mock">Local Mock Fallback</option>
            </select>
          </div>

          {/* Full preferences page link */}
          <div className="pt-2">
            <Link
              href="/settings/preferences"
              onClick={onClose}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Open Full Admin Preferences Page &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          {saved ? (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Preferences Saved!
            </span>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Changes apply instantly to current tenant session.
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3">
            <div className="flex items-center gap-2.5 text-amber-500">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Confirm Real Provider Mode</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Switching to Real Provider Mode incurs API token usage costs. Are you sure you want to activate live LLM execution?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmRealMode}
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold shadow-sm"
              >
                Confirm Real Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

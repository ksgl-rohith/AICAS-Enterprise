'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Key,
  Radio,
  Sliders,
  CheckCircle2,
  Lock,
  UserCheck,
  Sparkles,
} from 'lucide-react';

export interface AdminPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPreferencesModal({ isOpen, onClose }: AdminPreferencesModalProps) {
  const [publishingMode, setPublishingMode] = useState<'simulated' | 'live'>('simulated');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [openAiApiKey, setOpenAiApiKey] = useState('');
  const [safetyThreshold, setSafetyThreshold] = useState('90');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-purple-900/10 dark:bg-purple-950/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Admin Preferences & Controls</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  ADMIN ONLY
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure global platform governance, API credentials, and AI inference keys.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Section 1: Default Credentials Notice */}
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-start gap-3">
            <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-bold text-indigo-900 dark:text-indigo-200 block">
                System Default Admin Access Active
              </span>
              <p className="text-slate-600 dark:text-indigo-300/80 leading-relaxed">
                Log in credentials for Admin privileges: <strong>Username: admin</strong> | <strong>Password: admin@123</strong>.
                Admins hold override authority for safety thresholding and live publishing toggles.
              </p>
            </div>
          </div>

          {/* Section 2: Publishing Mode Toggle */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Global Publishing System Execution Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPublishingMode('simulated')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  publishingMode === 'simulated'
                    ? 'bg-indigo-500/10 border-indigo-500 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                }`}
              >
                <span className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                  Simulated Sandbox Mode
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Safely execute all multi-agent workflows with mock API publishing responses.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPublishingMode('live')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  publishingMode === 'live'
                    ? 'bg-emerald-500/10 border-emerald-500 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                }`}
              >
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                  Live API + Hybrid Publishing
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Broadcast live social posts to LinkedIn, Meta Graph API, and Telegram.
                </span>
              </button>
            </div>
          </div>

          {/* Section 3: AI Inference Keys */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500" /> AI Model Provider Credentials
            </label>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Google Gemini 2.5 API Key (`GEMINI_API_KEY`)
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  OpenAI API Key (`OPENAI_API_KEY`)
                </label>
                <input
                  type="password"
                  placeholder="sk-proj-..."
                  value={openAiApiKey}
                  onChange={(e) => setOpenAiApiKey(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Governance Safety Threshold */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Risk-Based Autonomy Compliance Score Cutoff (0 - 100)
            </label>
            <input
              type="number"
              min={60}
              max={99}
              value={safetyThreshold}
              onChange={(e) => setSafetyThreshold(e.target.value)}
              className="w-32 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-bold"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          {saved ? (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Admin Preferences Saved!
            </span>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Only users with ADMIN role can access these parameters.
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all"
          >
            Save Admin Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

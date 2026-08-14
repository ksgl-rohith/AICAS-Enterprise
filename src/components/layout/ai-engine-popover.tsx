'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Cpu, Zap, Lock, RefreshCw, X } from 'lucide-react';
import { EngineModeModal } from '@/components/ui/engine-mode-modal';

export function AiEnginePopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [engineMode, setEngineMode] = useState<'real' | 'mock'>('mock');
  const [realAvailable, setRealAvailable] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [hasOpenAIKey, setHasOpenAIKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchMode = async () => {
    try {
      const res = await fetch('/api/engine/mode');
      const data = await res.json();
      if (res.ok) {
        if (data.mode) setEngineMode(data.mode);
        setRealAvailable(Boolean(data.realAvailable));
        setHasGeminiKey(Boolean(data.hasGeminiKey));
        setHasOpenAIKey(Boolean(data.hasOpenAIKey));
      }
    } catch {
      // Ignore network errors on mode fetch
    }
  };

  useEffect(() => {
    fetchMode();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
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

  const switchMode = async (targetMode: 'real' | 'mock') => {
    setLoading(true);
    setShowConfirmModal(false);
    try {
      const res = await fetch('/api/engine/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: targetMode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEngineMode(data.mode);
      } else {
        alert(data.error || 'Failed to switch AI engine mode.');
      }
    } catch {
      alert('Error updating AI engine mode.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (engineMode === 'mock') {
      if (!realAvailable) {
        alert('REAL Engine unavailable: Missing GEMINI_API_KEY or OPENAI_API_KEY environment credentials.');
        return;
      }
      setShowConfirmModal(true);
    } else {
      switchMode('mock');
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="AI Engine Execution Mode"
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
          engineMode === 'real'
            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
            : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
        }`}
      >
        <Sparkles className={`w-3.5 h-3.5 ${engineMode === 'real' ? 'text-emerald-500' : 'text-amber-500'}`} />
        <span className="text-[11px] font-mono">
          AI Engine: <strong className="uppercase">{loading ? '...' : engineMode}</strong>
        </span>
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-500" />
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">AI Engine Control</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Execution Mode</span>
              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                engineMode === 'real'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300'
              }`}>
                {engineMode === 'real' ? 'REAL LLM' : 'MOCK ENGINE'}
              </span>
            </div>

            {engineMode === 'real' ? (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 font-mono text-[10px]">
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Provider:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{hasGeminiKey ? 'Gemini 2.5 Flash' : 'OpenAI GPT-4o'}</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Status:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Billing Tier:</span>
                  <span>Standard (Token Billed)</span>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-[10px] space-y-1">
                <p className="font-semibold">Simulated Model Output Active</p>
                <p className="text-[9.5px] leading-tight text-amber-700 dark:text-amber-400">
                  Model Gateway runs deterministic mock generation with zero API token cost.
                </p>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleToggle}
              disabled={loading}
              className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                engineMode === 'mock'
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{engineMode === 'mock' ? 'Switch to REAL LLM Engine' : 'Switch to MOCK Engine'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <EngineModeModal
        isOpen={showConfirmModal}
        onConfirm={() => switchMode('real')}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
}

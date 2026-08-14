'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, Sparkles, ShieldCheck, FileText } from 'lucide-react';

import { useAuth } from '@/components/auth-context';

export function FinalCTASection() {
  const { user } = useAuth();
  return (
    <section className="py-28 relative overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[500px] bg-gradient-to-tr from-indigo-100/70 dark:from-indigo-950/40 via-purple-100/50 dark:via-purple-950/30 to-transparent blur-[160px] pointer-events-none rounded-full" />

      {/* Main Glass Card Wrapper */}
      <div className="p-10 sm:p-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-indigo-950/20 backdrop-blur-2xl relative overflow-hidden space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Deploy Controlled Autonomy Today</span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Ready to Experience Enterprise AI Content Automation?
        </h2>

        <p className="text-slate-600 dark:text-slate-400 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
          Standardize your social media operations with 10 synchronized AI agents, deterministic legal compliance, vector knowledge RAG, and idempotent social publishing.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href={user ? '/dashboard' : '/login'}
            className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.03] transition-all flex items-center justify-center gap-3 group"
          >
            <span>{user ? 'Open Studio Workspace' : 'Launch AICAS Enterprise'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="#architecture"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold text-base hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-all flex items-center justify-center gap-2.5"
          >
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>View Architecture Specs</span>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="pt-10 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-600 dark:text-slate-400 font-mono font-semibold">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            AES-256-GCM Encryption
          </span>
          <span className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Gemini 2.5 Flash Powered
          </span>
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            100% Audit Lineage
          </span>
        </div>
      </div>
    </section>
  );
}

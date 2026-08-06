'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, Sparkles, ShieldCheck, FileText } from 'lucide-react';

export function FinalCTASection() {
  return (
    <section className="py-28 relative overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center bg-white">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[500px] bg-gradient-to-tr from-indigo-100/70 via-purple-100/50 to-transparent blur-[160px] pointer-events-none rounded-full" />

      {/* Main Glass Card Wrapper */}
      <div className="p-10 sm:p-16 rounded-3xl bg-white border border-slate-200 shadow-2xl backdrop-blur-2xl relative overflow-hidden space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Deploy Controlled Autonomy Today</span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Ready to Experience Enterprise AI Content Automation?
        </h2>

        <p className="text-slate-600 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
          Standardize your social media operations with 10 synchronized AI agents, deterministic legal compliance, vector knowledge RAG, and idempotent social publishing.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.03] transition-all flex items-center justify-center gap-3 group"
          >
            <span>Launch AICAS Enterprise</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="#architecture"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-800 hover:text-slate-900 font-semibold text-base hover:bg-slate-50 shadow-xs transition-all flex items-center justify-center gap-2.5"
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>View Architecture Specs</span>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="pt-10 border-t border-slate-200 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-600 font-mono font-semibold">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            AES-256-GCM Encryption
          </span>
          <span className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-600" />
            Gemini 2.5 Flash Powered
          </span>
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            100% Audit Lineage
          </span>
        </div>
      </div>
    </section>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Sparkles, Zap, Shield, Play, Bot, ShieldCheck, Layers } from 'lucide-react';
import { useAuth } from '@/components/auth-context';

export function Hero() {
  const { user } = useAuth();
  const workflowSteps = [
    { label: 'Plan', desc: 'Strategy & Pillaring' },
    { label: 'Research', desc: 'GDELT & Knowledge RAG' },
    { label: 'Create', desc: 'Multimodal Copy & Visuals' },
    { label: 'Review', desc: 'Deterministic Council' },
    { label: 'Schedule', desc: 'Cadence & Collision Check' },
    { label: 'Publish', desc: 'OAuth Social Connectors' },
    { label: 'Measure', desc: 'Normalized Metrics' },
    { label: 'Learn', desc: 'Causal Inference' },
    { label: 'Improve', desc: 'Policy Optimization' },
  ];

  const [activeWorkflowIndex, setActiveWorkflowIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveWorkflowIndex((prev) => (prev + 1) % workflowSteps.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [workflowSteps.length]);

  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Subtle Background Mesh Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] bg-gradient-to-tr from-indigo-200/50 via-purple-200/30 to-transparent dark:from-indigo-900/30 dark:via-purple-900/20 blur-[140px] pointer-events-none rounded-full" />
      
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-300 text-xs font-bold mb-8 shadow-xs">
        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <span>Enterprise Multi-Agent Social Content Operating System</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
      </div>

      {/* Main Hero Header - Clear Typographic Hierarchy */}
      <h1 className="max-w-5xl mx-auto mb-6 flex flex-col items-center">
        {/* Prominent Large Brand Name */}
        <span className="text-5xl sm:text-7xl lg:text-8xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 dark:from-indigo-400 dark:via-purple-300 dark:to-indigo-200 bg-clip-text text-transparent tracking-tight pb-3">
          AICAS Enterprise
        </span>
        
        {/* Smaller, Elegant Sub-Headline Title */}
        <span className="text-xl sm:text-3xl lg:text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-tight max-w-4xl mx-auto mt-2 leading-tight">
          Autonomous Multi-Agent Content Intelligence, Creation, Publishing & Growth Platform
        </span>
      </h1>

      {/* Subtitle Body Text */}
      <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
        Deploy 24 specialized domain AI agents working synchronously to ingest enterprise brand DNA, generate multimodal strategy, enforce deterministic quality controls, and publish across social channels.
      </p>

      {/* Animated Workflow Sequence Pill Bar */}
      <div className="w-full max-w-5xl mx-auto my-6 p-4 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-indigo-950/20 backdrop-blur-xl">
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-700 dark:text-slate-300 mb-3 flex items-center justify-center gap-2">
          <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Autonomous Execution Pipeline</span>
        </div>
        
        {/* Horizontal workflow steps */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5 sm:gap-2">
          {workflowSteps.map((step, idx) => {
            const isActive = idx === activeWorkflowIndex;
            return (
              <div
                key={step.label}
                onClick={() => setActiveWorkflowIndex(idx)}
                className={`cursor-pointer rounded-2xl p-2.5 transition-all duration-300 flex flex-col items-center justify-center text-center ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105 ring-2 ring-indigo-500'
                    : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60'
                }`}
              >
                <div className="text-[10px] font-black uppercase tracking-wider">
                  0{idx + 1}. {step.label}
                </div>
                <div className={`text-[9px] mt-0.5 font-bold truncate w-full ${isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                  {step.desc}
                </div>
              </div>
            );
          })}
        </div>

        {/* Animated Connector Indicator */}
        <div className="mt-3.5 flex items-center justify-between px-3 text-[11px] text-slate-700 dark:text-slate-300 font-mono pt-2 border-t border-slate-200 dark:border-slate-800 font-semibold">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Active Stage: <strong className="text-slate-900 dark:text-white font-bold">{workflowSteps[activeWorkflowIndex].label}</strong>
          </span>
          <span className="hidden sm:inline">Deterministic Quality Gate Enabled • 100% Policy Lineage</span>
        </div>
      </div>

      {/* Call to Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
        <Link
          href={user ? '/dashboard' : '/login'}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group"
        >
          <span>{user ? 'Open Studio Workspace' : 'Launch Application'}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>

        <a
          href="#overview"
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2.5"
        >
          <Play className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-indigo-100 dark:fill-indigo-950" />
          <span>Explore Platform</span>
        </a>
      </div>

      {/* Scroll Down Indicator */}
      <a
        href="#overview"
        className="mt-14 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex flex-col items-center gap-1.5 group text-xs font-bold"
      >
        <span>Discover Features</span>
        <ChevronDown className="w-4 h-4 animate-bounce group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
      </a>
    </section>
  );
}

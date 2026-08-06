'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Sparkles, Zap, Shield, Play } from 'lucide-react';

export function HeroSection() {
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
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 bg-white">
      {/* Subtle Background Mesh Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] bg-gradient-to-tr from-indigo-100/60 via-purple-100/40 to-transparent blur-[140px] pointer-events-none rounded-full" />
      
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold mb-8 shadow-xs">
        <Sparkles className="w-4 h-4 text-indigo-600" />
        <span>Enterprise Multi-Agent Social Content Operating System</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
      </div>

      {/* Main Hero Header - Clear Typographic Hierarchy */}
      <h1 className="max-w-5xl mx-auto mb-6 flex flex-col items-center">
        {/* Prominent Large Brand Name */}
        <span className="text-5xl sm:text-7xl lg:text-8xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent tracking-tight pb-3">
          AICAS Enterprise
        </span>
        
        {/* Smaller, Elegant Sub-Headline Title */}
        <span className="text-xl sm:text-3xl lg:text-4xl font-bold text-slate-800 tracking-tight max-w-4xl mx-auto mt-2 leading-tight">
          Autonomous Multi-Agent Content Intelligence, Creation, Publishing & Growth Platform
        </span>
      </h1>

      {/* Subtitle Body Text */}
      <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
        Deploy 24 specialized domain AI agents working synchronously to ingest enterprise brand DNA, generate multimodal strategy, enforce deterministic quality controls, and publish across social channels.
      </p>

      {/* Animated Workflow Sequence Pill Bar */}
      <div className="w-full max-w-5xl mx-auto my-6 p-4 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-700 mb-3 flex items-center justify-center gap-2">
          <Zap className="w-4 h-4 text-indigo-600" />
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
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200'
                }`}
              >
                <div className="text-[10px] font-black uppercase tracking-wider">
                  0{idx + 1}. {step.label}
                </div>
                <div className={`text-[9px] mt-0.5 font-bold truncate w-full ${isActive ? 'text-white' : 'text-slate-600'}`}>
                  {step.desc}
                </div>
              </div>
            );
          })}
        </div>

        {/* Animated Connector Indicator */}
        <div className="mt-3.5 flex items-center justify-between px-3 text-[11px] text-slate-700 font-mono pt-2 border-t border-slate-200 font-semibold">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600" />
            Active Stage: <strong className="text-slate-900 font-bold">{workflowSteps[activeWorkflowIndex].label}</strong>
          </span>
          <span className="hidden sm:inline">Deterministic Quality Gate Enabled • 100% Policy Lineage</span>
        </div>
      </div>

      {/* Call to Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
        <Link
          href="/dashboard"
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group"
        >
          <span>Launch Application</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>

        <a
          href="#overview"
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-slate-300 text-slate-900 hover:bg-slate-50 font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2.5"
        >
          <Play className="w-4 h-4 text-indigo-600 fill-indigo-100" />
          <span>Explore Platform</span>
        </a>
      </div>

      {/* Scroll Down Indicator */}
      <a
        href="#overview"
        className="mt-14 text-slate-600 hover:text-slate-900 transition-colors flex flex-col items-center gap-1.5 group text-xs font-bold"
      >
        <span>Discover Features</span>
        <ChevronDown className="w-4 h-4 animate-bounce group-hover:text-indigo-600" />
      </a>
    </section>
  );
}

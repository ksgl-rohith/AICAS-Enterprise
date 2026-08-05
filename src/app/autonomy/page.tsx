'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertOctagon, CheckCircle2, Sliders, Zap } from 'lucide-react';

export default function AutonomyPage() {
  const [mode, setMode] = useState<'COPILOT' | 'APPROVAL_REQUIRED' | 'RISK_BASED' | 'AUTONOMOUS_CAMPAIGN'>('APPROVAL_REQUIRED');
  const [isAutonomousFlagEnabled, setIsAutonomousFlagEnabled] = useState(false);

  const policyChecks = [
    { id: '1', title: 'Risk Score Threshold (<= 20)', status: true, detail: 'Current risk score: 10' },
    { id: '2', title: 'Factual Confidence (>= 0.85)', status: true, detail: 'Current confidence: 0.94' },
    { id: '3', title: 'Brand Safety Score (>= 85)', status: true, detail: 'Current brand score: 92' },
    { id: '4', title: 'Duplicate Similarity (<= 0.30)', status: true, detail: 'Current similarity: 0.05' },
    { id: '5', title: 'Platform Connector Health', status: true, detail: 'Status: CONNECTED' },
    { id: '6', title: 'Tenant Budget Availability', status: true, detail: 'Budget remaining: $457.85' },
    { id: '7', title: 'Crisis Pause Override Check', status: true, detail: 'No active crisis pause' },
    { id: '8', title: 'Unresolved Incidents Check', status: true, detail: 'No open platform incidents' },
    { id: '9', title: 'Mandatory Category Rule', status: true, detail: 'Standard marketing content' },
    { id: '10', title: 'Feature Flag (ENABLE_AUTONOMOUS_PUBLISHING)', status: isAutonomousFlagEnabled, detail: isAutonomousFlagEnabled ? 'Enabled' : 'Disabled (Default Safety)' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" /> Controlled Autonomy & Governance Controls
          </h1>
          <p className="text-xs text-slate-400">
            Configure oversight execution modes (COPILOT, APPROVAL_REQUIRED, RISK_BASED, AUTONOMOUS_CAMPAIGN).
          </p>
        </div>

        <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
          isAutonomousFlagEnabled ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
        }`}>
          Autonomous Mode: {isAutonomousFlagEnabled ? 'ENABLED' : 'DISABLED BY DEFAULT'}
        </span>
      </div>

      {/* Mode Selection Grid */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" /> Oversight Execution Mode
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {[
            { key: 'COPILOT', name: 'Copilot Mode', desc: 'AI drafts content; human manager generates and publishes manually.' },
            { key: 'APPROVAL_REQUIRED', name: 'Approval Required', desc: 'Full automated workflow; requires explicit human approval click before publishing.' },
            { key: 'RISK_BASED', name: 'Risk-Based Autonomy', desc: 'Low-risk items publish automatically if all 10 policy checks pass.' },
            { key: 'AUTONOMOUS_CAMPAIGN', name: 'Autonomous Campaign', desc: 'End-to-end autonomous execution under policy and budget controls.' },
          ].map((item) => (
            <div
              key={item.key}
              onClick={() => setMode(item.key as any)}
              className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                mode === item.key
                  ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-lg'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <strong className="font-bold text-white block">{item.name}</strong>
                {mode === item.key && <Zap className="w-3.5 h-3.5 text-indigo-400" />}
              </div>
              <p className="text-[11px] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 10 Controlled Autonomy Policy Gate Checkpoints */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" /> 10 Controlled Autonomy Policy Checkpoints
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {policyChecks.map((check) => (
            <div key={check.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-white block">{check.title}</span>
                <span className="text-[10px] text-slate-400">{check.detail}</span>
              </div>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                check.status ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
              }`}>
                {check.status ? 'PASS' : 'POLICY GATED'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

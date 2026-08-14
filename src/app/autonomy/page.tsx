'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Lock, Sliders, Zap, Cpu, DollarSign, Activity } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';

export default function AutonomyPage() {
  const [mode, setMode] = useState<'COPILOT' | 'APPROVAL_REQUIRED' | 'RISK_BASED' | 'AUTONOMOUS_CAMPAIGN'>('APPROVAL_REQUIRED');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAutonomyMetrics = () => {
    fetch('/api/autonomy')
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAutonomyMetrics();
  }, []);

  const summary = data?.summary || {};
  const policyChecks = data?.policyChecks || [];
  const agentBreakdown = data?.agentBreakdown || {};

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader
        eyebrow="Governance & Control"
        title="Controlled Autonomy & AI Resource Governance"
        description="Monitor original Model Gateway token metrics, free vs. paid AI usage, tenant budget availability, and policy checkpoints."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Governance' },
          { label: 'Controlled Autonomy' },
        ]}
        actions={
          <Badge variant="purple" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Oversight Mode: {mode.replace(/_/g, ' ')}
          </Badge>
        }
      />

      {/* Real AI Resource Usage Ledger Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Total Model Invocations</span>
            <Cpu className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {(summary.totalRequests || 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            Total Tokens: {(summary.totalTokens || 0).toLocaleString()}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Free Model / Mock Usage</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {(summary.freeRequests || 0).toLocaleString()} requests
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            Free Tokens: {(summary.freeTokens || 0).toLocaleString()} ($0.00 Cost)
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Paid Model Usage</span>
            <DollarSign className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
            ${(summary.paidSpendUsd || 0).toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            Paid Tokens: {(summary.paidTokens || 0).toLocaleString()} ({(summary.paidRequests || 0)} requests)
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Remaining AI Budget</span>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            ${(summary.remainingBudgetUsd || 500.0).toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            Monthly Cap: ${(summary.monthlyBudgetUsd || 500.0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Oversight Mode Selector */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Oversight Execution Mode
          </span>
          <span className="text-xs text-slate-400 font-mono">Active Policy Version: v2.5</span>
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
              onClick={async () => {
                const newMode = item.key as any;
                setMode(newMode);
                try {
                  await fetch('/api/autonomy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mode: newMode }),
                  });
                } catch {
                  // non-fatal UI state
                }
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                mode === item.key
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-slate-900 dark:text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <strong className="font-bold text-slate-900 dark:text-white block">{item.name}</strong>
                {mode === item.key && <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
              </div>
              <p className="text-[11px] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* What Does This Mean? Explanation Box */}
        <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 text-xs text-indigo-950 dark:text-indigo-200 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>What does this mean for system execution?</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            {mode === 'COPILOT' && 'AI agents generate strategy and copy proposals, but publishing and scheduling remain strictly manual actions driven by human operators.'}
            {mode === 'APPROVAL_REQUIRED' && 'AI agents run full preparatory campaign workflows autonomously, but publishing remains blocked until a human reviewer approves each post item.'}
            {mode === 'RISK_BASED' && 'AI can execute approved low-risk workflow steps automatically, while policy-sensitive actions and high-risk operations still require human oversight.'}
            {(mode === 'RISK_BASED' || mode === 'AUTONOMOUS_CAMPAIGN') && 'AI executes end-to-end campaign scheduling and publishing within configured policy boundaries, budget limits, and crisis overrides.'}
          </p>
        </div>
      </div>

      {/* Agent Usage Breakdown */}
      {Object.keys(agentBreakdown).length > 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-500" /> Multi-Agent AI Resource Usage Ledger
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {Object.entries(agentBreakdown).map(([agentName, stats]: [string, any]) => (
              <div key={agentName} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">{agentName}</span>
                <p className="text-[11px] text-slate-500">
                  Requests: <strong>{stats.requests}</strong> • Tokens: <strong>{stats.tokens.toLocaleString()}</strong>
                </p>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono block">
                  Estimated Spend: ${stats.spendUsd.toFixed(3)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DB-Backed 10 Policy Gate Checkpoints */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> 10 Controlled Autonomy Policy Checkpoints
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {policyChecks.map((check: any) => (
            <div key={check.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 dark:text-white block">{check.title}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">{check.detail}</span>
              </div>

              <Badge variant={check.status ? 'emerald' : 'amber'}>
                {check.status ? 'PASS' : 'POLICY GATED'}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

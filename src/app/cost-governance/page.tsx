'use client';

import React, { useState } from 'react';
import { DollarSign, Cpu, ShieldAlert, BarChart2, Layers } from 'lucide-react';

export default function CostGovernancePage() {
  const [budget, setBudget] = useState({
    monthlyBudgetUsd: 500.0,
    spentUsd: 42.15,
    taskTokenBudget: 50000,
    mediaBudgetUsd: 50.0,
    mediaSpentUsd: 6.75,
  });

  const [usageRecords] = useState([
    { id: '1', agentName: 'AnalyticsAgent', modelName: 'gemini-1.5-flash', tier: 'STANDARD', tokens: 1250, cost: 0.0018, isAnomaly: false },
    { id: '2', agentName: 'StrategyAgent', modelName: 'gpt-4o', tier: 'PREMIUM', tokens: 4800, cost: 0.0240, isAnomaly: false },
    { id: '3', agentName: 'VideoAgent', modelName: 'CloudRenderV1', tier: 'PREMIUM', tokens: 0, cost: 0.7500, isAnomaly: false },
  ]);

  const percentageUsed = ((budget.spentUsd / budget.monthlyBudgetUsd) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" /> Cost Governance & Model Gateway Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Tenant budget enforcement, tier-based model routing, token usage tracking, and cost anomaly detection.
          </p>
        </div>

        <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          Budget Status: Normal
        </span>
      </div>

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Tenant Budget</span>
          <div className="text-2xl font-bold text-white">${budget.spentUsd.toFixed(2)} / ${budget.monthlyBudgetUsd.toFixed(2)}</div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${percentageUsed}%` }}></div>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">{percentageUsed}% used of monthly allocation</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Media Generation Budget</span>
          <div className="text-2xl font-bold text-purple-400">${budget.mediaSpentUsd.toFixed(2)} / ${budget.mediaBudgetUsd.toFixed(2)}</div>
          <span className="text-[10px] text-purple-300 font-medium">Require Approval Config: ON</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Model Tier Policy</span>
          <div className="text-2xl font-bold text-indigo-400">Auto-Routing</div>
          <span className="text-[10px] text-slate-400 font-medium">Fallback: Mock/Economy Engine</span>
        </div>
      </div>

      {/* Usage Records Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" /> Recent Model & Agent Token Usage
        </h2>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-semibold">
                <th className="pb-2">Agent Name</th>
                <th className="pb-2">Model Used</th>
                <th className="pb-2">Tier</th>
                <th className="pb-2">Tokens</th>
                <th className="pb-2">Estimated Cost</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {usageRecords.map((r) => (
                <tr key={r.id}>
                  <td className="py-2.5 font-bold text-white">{r.agentName}</td>
                  <td className="py-2.5 font-mono text-indigo-400">{r.modelName}</td>
                  <td className="py-2.5">{r.tier}</td>
                  <td className="py-2.5 font-mono">{r.tokens.toLocaleString()}</td>
                  <td className="py-2.5 font-bold text-emerald-400">${r.cost.toFixed(4)}</td>
                  <td className="py-2.5">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Approved
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

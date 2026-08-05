'use client';

import React, { useState } from 'react';
import { DollarSign, Cpu } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { MetricCard } from '@/components/ui/metric-card';
import { Badge } from '@/components/ui/badge';

export default function CostGovernancePage() {
  const [budget] = useState({
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
      <PageHeader
        eyebrow="Governance & Observability"
        title="Cost Governance & Model Gateway"
        description="Tenant budget enforcement, tier-based model routing, token usage tracking, and cost anomaly detection."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Governance' },
          { label: 'Cost Governance' },
        ]}
        actions={
          <Badge variant="emerald" icon={<DollarSign className="w-3.5 h-3.5" />}>
            Budget Status: Normal
          </Badge>
        }
      />

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Monthly Tenant Budget</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">${budget.spentUsd.toFixed(2)} / ${budget.monthlyBudgetUsd.toFixed(2)}</div>
          <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${percentageUsed}%` }}></div>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{percentageUsed}% used of monthly allocation</span>
        </div>

        <MetricCard
          title="Media Generation Budget"
          value={`$${budget.mediaSpentUsd.toFixed(2)} / $${budget.mediaBudgetUsd.toFixed(2)}`}
          subtitle="Require Approval Config: ON"
          icon={DollarSign}
          iconColor="text-purple-500"
        />

        <MetricCard
          title="Model Tier Policy"
          value="Auto-Routing"
          subtitle="Fallback: Economy Engine"
          icon={Cpu}
          iconColor="text-indigo-500"
        />
      </div>

      {/* Usage Records Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Recent Model & Agent Token Usage
        </h2>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-semibold">
                <th className="pb-2">Agent Name</th>
                <th className="pb-2">Model Used</th>
                <th className="pb-2">Tier</th>
                <th className="pb-2">Tokens</th>
                <th className="pb-2">Estimated Cost</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {usageRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-2.5 font-bold text-slate-900 dark:text-white">{r.agentName}</td>
                  <td className="py-2.5 font-mono text-indigo-600 dark:text-indigo-400">{r.modelName}</td>
                  <td className="py-2.5">{r.tier}</td>
                  <td className="py-2.5 font-mono tabular-nums">{r.tokens.toLocaleString()}</td>
                  <td className="py-2.5 font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">${r.cost.toFixed(4)}</td>
                  <td className="py-2.5">
                    <Badge variant="emerald">Approved</Badge>
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

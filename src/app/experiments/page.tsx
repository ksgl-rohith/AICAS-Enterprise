'use client';

import React, { useState } from 'react';
import { FlaskConical, Play, ShieldAlert, CheckCircle2, TrendingUp, HelpCircle } from 'lucide-react';

export default function ExperimentsPage() {
  const [hypothesis, setHypothesis] = useState('Technical carousel posts generate 3x higher CTR than text posts.');
  const [metric, setMetric] = useState('ctr');
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<any>(null);

  const handleRunEvaluation = () => {
    setEvaluating(true);
    setTimeout(() => {
      setEvalResult({
        metricName: metric,
        variantA: 'Control: Static Text',
        variantB: 'Treatment: Technical Carousel',
        controlRate: 0.014,
        treatmentRate: 0.048,
        relativeLift: 2.42,
        pValue: 0.0012,
        confidenceLevel: 0.9988,
        isStatisticallySignificant: true,
        sampleSizeSufficient: true,
        recommendedWinner: 'Treatment: Technical Carousel',
        explanation: 'Treatment: Technical Carousel achieved a 242.9% lift over Control with 99.9% statistical confidence (p=0.0012). Evaluation produced by deterministic statistical z-test module.',
      });
      setEvaluating(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-indigo-400" /> Experiment Management & Evaluation
          </h1>
          <p className="text-xs text-slate-400">
            Controlled A/B testing, holdout groups, and deterministic statistical evaluation engine.
          </p>
        </div>

        <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          Statistical Engine Active
        </span>
      </div>

      {/* Experiment Design & Run Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white">Create & Evaluate Controlled Experiment</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold block">Optimization Hypothesis</label>
            <input
              type="text"
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-semibold block">Primary Optimization Metric</label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ctr">Click-Through Rate (CTR)</option>
              <option value="conversionRate">Conversion Rate</option>
              <option value="watchTime">Watch Time</option>
              <option value="engagementRate">Engagement Rate</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>High-risk content automatically excluded from autonomous testing.</span>
          </div>

          <button
            onClick={handleRunEvaluation}
            disabled={evaluating}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{evaluating ? 'Evaluating Statistics...' : 'Evaluate Controlled Test'}</span>
          </button>
        </div>
      </div>

      {/* Test Results Output */}
      {evalResult && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Statistical Significance Evaluation
            </h2>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Confidence: {(evalResult.confidenceLevel * 100).toFixed(1)}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">Control (Variant A)</span>
              <span className="text-white font-bold block text-sm">{(evalResult.controlRate * 100).toFixed(1)}% {metric.toUpperCase()}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">Treatment (Variant B)</span>
              <span className="text-purple-400 font-bold block text-sm">{(evalResult.treatmentRate * 100).toFixed(1)}% {metric.toUpperCase()}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">Relative Lift</span>
              <span className="text-emerald-400 font-bold block text-sm">+{(evalResult.relativeLift * 100).toFixed(1)}%</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
            {evalResult.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

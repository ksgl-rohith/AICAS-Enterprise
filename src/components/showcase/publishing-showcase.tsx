'use client';

import React from 'react';
import { Send, CheckCircle2, Lock } from 'lucide-react';

export function PublishingShowcaseSection() {
  const steps = [
    { label: 'Queued', time: '14:20:00 UTC', status: 'COMPLETE', desc: 'Draft entity created' },
    { label: 'Approved', time: '14:21:15 UTC', status: 'COMPLETE', desc: 'Review Council Passed (Score 98)' },
    { label: 'Scheduled', time: '14:22:00 UTC', status: 'COMPLETE', desc: 'Queued for Monday 14:00 UTC' },
    { label: 'Publishing', time: '14:25:00 UTC', status: 'COMPLETE', desc: 'AES-256 OAuth Token verified' },
    { label: 'Published', time: '14:25:02 UTC', status: 'COMPLETE', desc: 'HTTP 201 Created from API' },
    { label: 'Success', time: '14:25:03 UTC', status: 'COMPLETE', desc: 'Permalink verified & ledger updated' },
  ];

  return (
    <section className="py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
          <Send className="w-3.5 h-3.5" />
          <span>Publishing & Connector Ledger</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
          Idempotent Publishing & Real-Time API Progression
        </h2>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          Track the exact execution timeline from draft queueing to live social API publishing with encrypted token handshakes.
        </p>
      </div>

      {/* Progress Timeline Frame */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              Publication Execution Ledger #pub_idemp_9f82a1
            </h3>
            <p className="text-xs text-slate-500 mt-1">LinkedIn REST API OAuth 2.0 • Hardware AES-256 Encryption</p>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-mono font-semibold border border-emerald-200 self-start sm:self-auto">
            Status: SUCCESS (201 Created)
          </span>
        </div>

        {/* Timeline Progression Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {steps.map((step, idx) => (
            <div
              key={step.label}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative overflow-hidden group hover:border-emerald-400 transition-colors shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-700 font-mono">0{idx + 1}. {step.label}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xs font-bold text-slate-900">{step.time}</div>
              <div className="text-[10px] text-slate-600 leading-snug">{step.desc}</div>
            </div>
          ))}
        </div>

        {/* API Response Headers Console Mockup */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-2 text-slate-800">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Live API Response Console</div>
          <div className="text-emerald-700 font-bold">POST https://api.linkedin.com/v2/ugcPosts</div>
          <div className="text-slate-600 text-[11px]">Headers: Authorization: Bearer [AES-256-GCM Encrypted Token]</div>
          <div className="text-slate-600 text-[11px]">Idempotency-Key: pub_idemp_9f82a1</div>
          <div className="text-indigo-700 font-bold text-[11px] pt-1">
            HTTP/2 201 Created • Response Time: 184ms • Post Permalink: https://linkedin.com/feed/update/urn:li:share:71928401
          </div>
        </div>
      </div>
    </section>
  );
}

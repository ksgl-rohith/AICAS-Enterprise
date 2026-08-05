'use client';

import React, { useState } from 'react';
import { MessageSquare, AlertTriangle, ShieldCheck, Send, CheckCircle2, User } from 'lucide-react';

export default function CommunityPage() {
  const [messages, setMessages] = useState([
    {
      id: 'msg_01',
      platform: 'linkedin',
      senderHandle: '@tech_director_saas',
      content: 'How does AICAS Enterprise handle data privacy and tenant isolation when connecting LLM models?',
      classification: 'QUESTION',
      suggestedResponse: 'Great question! AICAS Enterprise implements strict row-level security in database queries, encrypts platform tokens with AES-256-GCM, and ensures tenant contexts are isolated in RAG retrievals.',
      isEscalated: false,
      status: 'INBOX',
    },
    {
      id: 'msg_02',
      platform: 'linkedin',
      senderHandle: '@anonymous_user',
      content: 'We are filing a legal lawsuit regarding unauthorized trademark usage in your demo video.',
      classification: 'CRISIS_RISK',
      suggestedResponse: 'Thank you for reaching out. Our legal and compliance team has received your message and will inspect the context immediately.',
      isEscalated: true,
      escalationReason: 'Sensitive legal/lawsuit keyword detected.',
      status: 'ESCALATED',
    },
  ]);

  const handleApprove = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'APPROVED_FOR_POSTING' } : m))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" /> Community Review Inbox & Escalations
          </h1>
          <p className="text-xs text-slate-400">
            10-category message classification, AI response drafting, safety review, and crisis escalation.
          </p>
        </div>

        <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
          Autonomous Posting: OFF (Review Required)
        </span>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white">Community Messages Inbox</h2>

        <div className="space-y-4 text-xs">
          {messages.map((msg) => (
            <div key={msg.id} className={`p-4 rounded-xl bg-slate-950 border space-y-3 ${msg.isEscalated ? 'border-red-500/40' : 'border-slate-800'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-white">{msg.senderHandle}</span>
                  <span className="text-[10px] text-indigo-400 uppercase font-mono">[{msg.platform}]</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    msg.isEscalated ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-indigo-500/20 text-indigo-300'
                  }`}>
                    {msg.classification}
                  </span>
                </div>

                <span className="text-[10px] text-slate-400">Status: {msg.status}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
                "{msg.content}"
              </div>

              {msg.suggestedResponse && (
                <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/20 space-y-1">
                  <span className="text-[10px] text-indigo-400 uppercase font-bold block">Drafted Brand AI Response</span>
                  <p className="text-slate-200">{msg.suggestedResponse}</p>
                </div>
              )}

              {msg.isEscalated && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>ESCALATED: {msg.escalationReason} Sent to legal/PR escalation queue.</span>
                </div>
              )}

              {msg.status === 'INBOX' && !msg.isEscalated && (
                <div className="flex justify-end pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleApprove(msg.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Approve & Send Reply</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

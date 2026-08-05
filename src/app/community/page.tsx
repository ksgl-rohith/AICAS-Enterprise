'use client';

import React, { useState } from 'react';
import { MessageSquare, AlertTriangle, Send, User } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';

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
      <PageHeader
        eyebrow="Content Operations"
        title="Community Review Inbox & Escalations"
        description="10-category message classification, AI response drafting, safety review, and crisis escalation."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content Operations' },
          { label: 'Community Inbox' },
        ]}
        actions={
          <Badge variant="amber" icon={<MessageSquare className="w-3.5 h-3.5" />}>
            Autonomous Posting: OFF (Review Required)
          </Badge>
        }
      />

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Community Messages Inbox</h2>

        <div className="space-y-4 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border space-y-3 ${
                msg.isEscalated ? 'border-red-300 dark:border-red-900/60' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-slate-900 dark:text-white">{msg.senderHandle}</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-mono">[{msg.platform}]</span>
                  <Badge variant={msg.isEscalated ? 'red' : 'indigo'}>
                    {msg.classification}
                  </Badge>
                </div>

                <span className="text-[10px] text-slate-500 dark:text-slate-400">Status: {msg.status}</span>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                "{msg.content}"
              </div>

              {msg.suggestedResponse && (
                <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 space-y-1">
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-bold block">Drafted Brand AI Response</span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{msg.suggestedResponse}</p>
                </div>
              )}

              {msg.isEscalated && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300 text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>ESCALATED: {msg.escalationReason} Sent to legal/PR escalation queue.</span>
                </div>
              )}

              {msg.status === 'INBOX' && !msg.isEscalated && (
                <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => handleApprove(msg.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 transition-all"
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

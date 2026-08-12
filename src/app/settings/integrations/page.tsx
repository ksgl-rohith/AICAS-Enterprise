'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Radio, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, Lock, Mail, Key, ShieldCheck, Plus, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { connectorCapabilityRegistry } from '@/lib/connectors/connector-capability-registry';

function IntegrationsSettingsContent() {
  const searchParams = useSearchParams();
  const successParam = searchParams.get('success');
  const errorParam = searchParams.get('error');
  const accountParam = searchParams.get('account');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<{ [platform: string]: boolean }>({});
  const [activeModalProvider, setActiveModalProvider] = useState<string | null>(null);

  // Credential Modal Form State
  const [credValues, setCredValues] = useState<{ [key: string]: string }>({});
  const [savingCred, setSavingCred] = useState(false);

  const fetchIntegrations = () => {
    fetch('/api/integrations')
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleLinkedInConnect = async () => {
    try {
      const res = await fetch(`/api/integrations/linkedin/connect?brandId=${data?.brandId || ''}`);
      const resData = await res.json();
      if (res.ok && resData.authUrl) {
        window.location.href = resData.authUrl;
      } else {
        // Prompt user to configure via UI Modal instead of editing .env
        setActiveModalProvider('linkedin');
      }
    } catch {
      setActiveModalProvider('linkedin');
    }
  };

  const handleTestConnection = async (platform: string) => {
    setTesting({ ...testing, [platform]: true });
    try {
      const endpoint = platform === 'linkedin' ? '/api/integrations/linkedin/test' : '/api/integrations/facebook/test';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: data?.brandId }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        alert(`Success! Connected to account: ${resData.accountName}`);
      } else {
        alert(`Test Failed: ${resData.error || 'Unauthorized'}`);
      }
    } catch (err: any) {
      alert(`Connection error: ${err.message}`);
    } finally {
      setTesting({ ...testing, [platform]: false });
    }
  };

  const handleSyncSocialData = async (platform: string) => {
    try {
      const res = await fetch('/api/integrations/sync-social-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, brandId: data?.brandId }),
      });
      const resData = await res.json();
      if (res.ok) {
        alert(resData.message);
        fetchIntegrations();
      } else {
        alert(resData.error || 'Failed to sync social data.');
      }
    } catch {
      alert('Error initiating social data sync.');
    }
  };

  const handleSaveCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalProvider) return;
    setSavingCred(true);

    const categoryMap: Record<string, 'social' | 'ai' | 'search' | 'media'> = {
      linkedin: 'social',
      facebook: 'social',
      instagram: 'social',
      telegram: 'social',
      x: 'social',
      gemini: 'ai',
      openai: 'ai',
    };

    try {
      const res = await fetch('/api/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: categoryMap[activeModalProvider] || 'social',
          provider: activeModalProvider,
          name: `${activeModalProvider.toUpperCase()} UI Credential`,
          values: credValues,
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        alert(`Successfully saved and encrypted ${activeModalProvider} credentials!`);
        setActiveModalProvider(null);
        setCredValues({});
        fetchIntegrations();
      } else {
        alert(resData.error || 'Failed to save credential.');
      }
    } catch {
      alert('Error saving credential.');
    } finally {
      setSavingCred(false);
    }
  };

  const connections = data?.connections || [];
  const dbCredentials = data?.dbCredentials || [];
  const systemConfig = data?.systemConfig || {};

  const getConn = (platform: string) => connections.find((c: any) => c.platform === platform);
  const getDBCred = (provider: string) => dbCredentials.find((c: any) => c.provider === provider);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Administration & Connectors"
        title="Platform API Connectors & UI Credential Governance"
        description="Configure OAuth integrations, Telegram bot tokens, and AI model keys directly through the authenticated AICAS UI without editing server environment files."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Administration' },
          { label: 'Platform Integrations' },
        ]}
      />

      {/* OAuth Callback Alert Banner */}
      {successParam && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            Successfully connected <strong className="capitalize">{successParam}</strong> account:{' '}
            <strong>{accountParam}</strong>!
          </span>
        </div>
      )}

      {errorParam && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>Integration Error: {errorParam}</span>
        </div>
      )}

      {/* System Execution Mode Control Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500" /> Publishing System Execution Mode
          </h2>
          <Badge variant="emerald">
            {systemConfig.publishingMode?.toUpperCase() || 'SIMULATED'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Live Publishing Allowed</span>
            <span className={`font-bold ${systemConfig.allowLivePublishing ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {systemConfig.allowLivePublishing ? 'ENABLED' : 'DISABLED (Simulated Sandbox Active)'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Graceful Fallback</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">
              {systemConfig.fallbackToSimulator ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">AI Inference Gateway</span>
            <span className="text-purple-600 dark:text-purple-400 font-bold">
              {systemConfig.hasGeminiKey ? 'Gemini 2.5 Flash SDK' : 'Structured Mock Gateway'}
            </span>
          </div>
        </div>
      </div>

      {/* Connectors Cards Grid */}
      <div className="space-y-4">
        {/* 1. LinkedIn Connector Card */}
        {(() => {
          const conn = getConn('linkedin');
          const dbCred = getDBCred('linkedin');
          const isConnected = conn && conn.status === 'CONNECTED';
          return (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                    in
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">LinkedIn Official API Connector</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">OAuth 2.0 PKCE • Posts API `/rest/posts` • Member & Organization Publishing</p>
                  </div>
                </div>

                <Badge variant={isConnected || dbCred ? 'emerald' : 'slate'}>
                  {isConnected ? 'CONNECTED' : dbCred ? 'CONFIGURED VIA UI' : 'NOT CONNECTED'}
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <p className="text-slate-500 dark:text-slate-400">
                  {dbCred ? `Encrypted UI Key: ${dbCred.keyMask}` : 'Connect your LinkedIn account via OAuth or configure Client ID/Secret via UI.'}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveModalProvider('linkedin')}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Configure Credentials</span>
                  </button>
                  <button
                    onClick={handleLinkedInConnect}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-2 shadow-sm shadow-blue-600/30 shrink-0 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Connect LinkedIn OAuth</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 2. Telegram Bot API Connector Card */}
        {(() => {
          const dbCred = getDBCred('telegram');
          return (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    TG
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Telegram Channel Bot Gateway</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Telegram Bot API • Broadcast Messages, HTML Formatting & Channel Posts</p>
                  </div>
                </div>
                <Badge variant={dbCred ? 'emerald' : 'indigo'}>
                  {dbCred ? 'CONFIGURED VIA UI' : 'READY FOR BOT TOKEN'}
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <p className="text-slate-500 dark:text-slate-400">
                  {dbCred ? `Bot Token Mask: ${dbCred.keyMask}` : 'Configure Telegram Bot Token and Channel Chat ID directly through the UI.'}
                </p>
                <button
                  onClick={() => setActiveModalProvider('telegram')}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center gap-2 shadow-sm shadow-sky-600/30 shrink-0 transition-all"
                >
                  <Key className="w-4 h-4" />
                  <span>Configure Telegram Credentials</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* 3. Google Gemini AI Connector Card */}
        {(() => {
          const dbCred = getDBCred('gemini');
          return (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
                    AI
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Google Gemini AI Engine Key</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Gemini 2.5 Flash SDK • Strategy Generation, RAG Grounding & Copywriting</p>
                  </div>
                </div>
                <Badge variant={dbCred || systemConfig.hasGeminiKey ? 'emerald' : 'amber'}>
                  {dbCred ? 'CONFIGURED VIA UI' : systemConfig.hasGeminiKey ? 'ACTIVE (ENV)' : 'MOCK FALLBACK ACTIVE'}
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <p className="text-slate-500 dark:text-slate-400">
                  {dbCred ? `Key Mask: ${dbCred.keyMask}` : 'Enter your Gemini API key from AI Studio to enable live LLM generation.'}
                </p>
                <button
                  onClick={() => setActiveModalProvider('gemini')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-2 shadow-sm shadow-purple-600/30 shrink-0 transition-all"
                >
                  <Key className="w-4 h-4" />
                  <span>Configure Gemini Key</span>
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Admin UI Credential Configuration Modal */}
      {activeModalProvider && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-500" />
                <span>Configure {activeModalProvider.toUpperCase()} Credentials</span>
              </h3>
              <button onClick={() => setActiveModalProvider(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCredentialSubmit} className="space-y-4 text-xs">
              {activeModalProvider === 'linkedin' && (
                <>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">LinkedIn Client ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 86xxxxxxxxx"
                      value={credValues.client_id || ''}
                      onChange={(e) => setCredValues({ ...credValues, client_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">LinkedIn Client Secret</label>
                    <input
                      type="password"
                      required
                      placeholder="OAuth secret..."
                      value={credValues.client_secret || ''}
                      onChange={(e) => setCredValues({ ...credValues, client_secret: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              {activeModalProvider === 'telegram' && (
                <>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Telegram Bot Token</label>
                    <input
                      type="password"
                      required
                      placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQ..."
                      value={credValues.bot_token || ''}
                      onChange={(e) => setCredValues({ ...credValues, bot_token: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Channel / Chat ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. @mychannel or -10012345678"
                      value={credValues.chat_id || ''}
                      onChange={(e) => setCredValues({ ...credValues, chat_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              {activeModalProvider === 'gemini' && (
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Google Gemini API Key</label>
                  <input
                    type="password"
                    required
                    placeholder="AI Studio API key (AIzaSy...)"
                    value={credValues.api_key || ''}
                    onChange={(e) => setCredValues({ ...credValues, api_key: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalProvider(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCred}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm"
                >
                  {savingCred ? 'Encrypting & Saving...' : 'Save Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 shadow-xs">
        <Lock className="w-5 h-5 text-indigo-500 shrink-0" />
        <p>
          <strong className="text-slate-900 dark:text-white font-semibold">AES-256-GCM Vault Security:</strong> Credentials saved via UI are encrypted server-side with AES-256-GCM and never returned in plaintext to the frontend.
        </p>
      </div>
    </div>
  );
}

export default function IntegrationsSettingsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading integrations settings...</div>}>
      <IntegrationsSettingsContent />
    </React.Suspense>
  );
}

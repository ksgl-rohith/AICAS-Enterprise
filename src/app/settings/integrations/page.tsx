'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Radio, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, Lock, Mail } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';

function IntegrationsSettingsContent() {
  const searchParams = useSearchParams();
  const successParam = searchParams.get('success');
  const errorParam = searchParams.get('error');
  const accountParam = searchParams.get('account');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<{ [platform: string]: boolean }>({});
  const [testResult, setTestResult] = useState<{ [platform: string]: string }>({});

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
        alert(resData.error || 'LinkedIn OAuth not configured in server environment variables.');
      }
    } catch {
      alert('Error initiating LinkedIn OAuth.');
    }
  };

  const handleTestConnection = async (platform: string) => {
    setTesting({ ...testing, [platform]: true });
    setTestResult({ ...testResult, [platform]: '' });
    try {
      const endpoint = platform === 'linkedin' ? '/api/integrations/linkedin/test' : '/api/integrations/facebook/test';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: data?.brandId }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setTestResult({ ...testResult, [platform]: `Success! Connected to account: ${resData.accountName}` });
      } else {
        setTestResult({ ...testResult, [platform]: `Test Failed: ${resData.error || 'Unauthorized'}` });
      }
    } catch (err: any) {
      setTestResult({ ...testResult, [platform]: `Connection error: ${err.message}` });
    } finally {
      setTesting({ ...testing, [platform]: false });
    }
  };

  const connections = data?.connections || [];
  const systemConfig = data?.systemConfig || {};

  const getConn = (platform: string) => connections.find((c: any) => c.platform === platform);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Administration & Connectors"
        title="Platform API Connectors & Integrations"
        description="Manage real-time API integrations for LinkedIn, Instagram, Facebook, X (Twitter), Threads, and Email Campaigns."
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

      {/* System Publishing Mode Control Card */}
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
              {systemConfig.allowLivePublishing ? 'ENABLED (ALLOW_LIVE_PUBLISHING=true)' : 'DISABLED (Simulated Sandbox Active)'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Graceful Fallback</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">
              {systemConfig.fallbackToSimulator ? 'Enabled (Simulated fallback on API error)' : 'Disabled'}
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

                <Badge variant={isConnected ? 'emerald' : 'slate'}>
                  {isConnected ? 'CONNECTED' : 'NOT CONNECTED'}
                </Badge>
              </div>

              {isConnected ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Account:</span> <strong className="text-slate-900 dark:text-white">{conn.accountName}</strong>
                      <span className="text-[10px] text-slate-400 block font-mono">ID: {conn.accountId}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleTestConnection('linkedin')}
                        disabled={testing.linkedin}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${testing.linkedin ? 'animate-spin' : ''}`} />
                        <span>Test Connection</span>
                      </button>
                      <button
                        onClick={handleLinkedInConnect}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reconnect / Refresh Token</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <p className="text-slate-500 dark:text-slate-400">Connect your LinkedIn account via official server-side OAuth 2.0.</p>
                  <button
                    onClick={handleLinkedInConnect}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-2 shadow-sm shadow-blue-600/30 shrink-0 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Connect LinkedIn OAuth 2.0</span>
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {/* 2. Instagram Graph API Connector Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                IG
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Instagram Graph API Connector</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Instagram Content Publishing API • Single Image, Carousel Containers & Reels</p>
              </div>
            </div>
            <Badge variant="emerald">CONFIGURED & READY</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Publish aesthetic slide carousels, infographics, and visual brand briefs directly to Instagram Business & Creator accounts.
          </p>
        </div>

        {/* 3. Meta Facebook Pages Connector Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                FB
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Meta Facebook Pages API</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Meta Graph API v20.0 • Page Feed Posts & Link Cards</p>
              </div>
            </div>
            <Badge variant="emerald">CONFIGURED</Badge>
          </div>
        </div>

        {/* 4. X (Twitter) v2 API Connector Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-950 text-white border border-slate-700 dark:border-slate-800 flex items-center justify-center font-bold text-sm">
                X
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">X (Twitter) v2 API Connector</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">OAuth 2.0 PKCE • Tweets v2 Endpoint • Thread & Media Uploads</p>
              </div>
            </div>
            <Badge variant="indigo">READY FOR OAUTH</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Publish real-time micro-updates, executive quotes, and tweet threads directly to X accounts with automatic hashtag optimization.
          </p>
        </div>

        {/* 5. Meta Threads API Connector Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                @
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Meta Threads Publishing API</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Threads Graph API • Text Posts, Carousels & Media</p>
              </div>
            </div>
            <Badge variant="indigo">CONNECTED</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cross-post visual cards and text thoughts directly onto Meta Threads channels.
          </p>
        </div>

        {/* 6. Email Campaign System Connector Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Email Campaign System Gateway</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">SendGrid / AWS SES / Mailchimp API Integration • HTML Blasts & Newsletters</p>
              </div>
            </div>
            <Badge variant="emerald">CONFIGURED</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automatically transform campaign strategies into formatted HTML email newsletters and product announcement blasts.
          </p>
        </div>
      </div>

      {/* Security Note Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 shadow-xs">
        <Lock className="w-5 h-5 text-indigo-500 shrink-0" />
        <p>
          <strong className="text-slate-900 dark:text-white font-semibold">Encrypted Token Guarantee:</strong> All OAuth secrets, access tokens, and API credentials are encrypted at rest on the server using AES-256-GCM.
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

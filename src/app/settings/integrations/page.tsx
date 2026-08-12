'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Radio, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, Lock, Key, Send, Download, GitMerge, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { connectorCapabilityRegistry, IntegrationGroup, ConnectorCapability } from '@/lib/connectors/connector-capability-registry';
import { PublishDrawer } from '@/components/integrations/publish-drawer';
import { ExportPackageDrawer } from '@/components/integrations/export-package-drawer';
import { PotentialDuplicatesModal } from '@/components/brands/potential-duplicates-modal';

function IntegrationsSettingsContent() {
  const searchParams = useSearchParams();
  const successParam = searchParams.get('success');
  const errorParam = searchParams.get('error');
  const accountParam = searchParams.get('account');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<{ [platform: string]: boolean }>({});
  const [activeModalProvider, setActiveModalProvider] = useState<string | null>(null);

  // Drawer & Utility States
  const [publishPlatform, setPublishPlatform] = useState<string | null>(null);
  const [exportPlatform, setExportPlatform] = useState<string | null>(null);
  const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);

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
        setActiveModalProvider('linkedin');
      }
    } catch {
      setActiveModalProvider('linkedin');
    }
  };

  const handleFacebookConnect = async () => {
    try {
      const res = await fetch(`/api/integrations/facebook/connect?brandId=${data?.brandId || ''}`);
      const resData = await res.json();
      if (res.ok && resData.authUrl) {
        window.location.href = resData.authUrl;
      } else {
        setActiveModalProvider('facebook');
      }
    } catch {
      setActiveModalProvider('facebook');
    }
  };

  const handleTestConnection = async (platform: string) => {
    setTesting({ ...testing, [platform]: true });
    try {
      const endpoint =
        platform === 'linkedin'
          ? '/api/integrations/linkedin/test'
          : '/api/integrations/facebook/test';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: data?.brandId }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        alert(`Success! Connected to account: ${resData.accountName}`);
      } else {
        alert(`Test Connection Result: ${resData.error || 'Connected and validated'}`);
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
      youtube: 'social',
      wordpress: 'social',
      website: 'social',
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

  const groups: IntegrationGroup[] = [
    'Social Publishing',
    'Video',
    'Messaging',
    'Discovery & Community',
    'Owned Media',
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          eyebrow="Administration & Connectors"
          title="Platform Integration Center & Governed Live Publishing"
          description="Manage OAuth connections, API credentials, duplicate Brand Profiles, and trigger governed live publishing directly from the integration center."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Administration' },
            { label: 'Platform Integrations' },
          ]}
        />

        <button
          onClick={() => setShowDuplicatesModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 shrink-0 self-start md:self-auto transition-all"
        >
          <GitMerge className="w-4 h-4" />
          <span>Review Duplicate Brand Profiles</span>
        </button>
      </div>

      {/* Callback Alert Banners */}
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

      {/* System Execution Mode Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
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
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Live Publishing</span>
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
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">AI Gateway Engine</span>
            <span className="text-purple-600 dark:text-purple-400 font-bold">
              {systemConfig.hasGeminiKey ? 'Gemini 2.5 Flash SDK' : 'Structured Mock Gateway'}
            </span>
          </div>
        </div>
      </div>

      {/* Integration Categories Grid */}
      <div className="space-y-8">
        {groups.map((group) => {
          const capabilities = connectorCapabilityRegistry.getCapabilitiesByGroup(group);
          if (capabilities.length === 0) return null;

          return (
            <div key={group} className="space-y-4">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{group}</h3>
                <span className="text-xs text-slate-400">{capabilities.length} Targets</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {capabilities.map((cap: ConnectorCapability) => {
                  const conn = getConn(cap.platform);
                  const dbCred = getDBCred(cap.platform);
                  const isConnected = conn && conn.status === 'CONNECTED';
                  const isConfigured = isConnected || Boolean(dbCred);

                  return (
                    <div
                      key={cap.platform}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                              {cap.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm">{cap.name}</h4>
                              <span className="text-[10px] text-slate-400 uppercase font-mono">{cap.authenticationType}</span>
                            </div>
                          </div>

                          <Badge variant={isConfigured ? 'emerald' : cap.status === 'EXPORT_ONLY' ? 'amber' : 'slate'}>
                            {isConfigured ? 'CONNECTED' : cap.status}
                          </Badge>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{cap.description}</p>

                        {/* Capabilities Tags */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {cap.publishing && <Badge variant="slate">Publishing</Badge>}
                          {cap.analytics && <Badge variant="slate">Analytics</Badge>}
                          {cap.mediaUpload && <Badge variant="slate">Media</Badge>}
                          {cap.videoUpload && <Badge variant="slate">Video</Badge>}
                          {cap.carousel && <Badge variant="slate">Carousel</Badge>}
                          {cap.scheduling && <Badge variant="slate">Scheduling</Badge>}
                        </div>
                      </div>

                      {/* Dynamic Action Buttons */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setActiveModalProvider(cap.platform)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-colors text-[11px]"
                          >
                            <Key className="w-3 h-3 inline mr-1" /> Creds
                          </button>

                          {cap.platform === 'linkedin' && (
                            <button
                              onClick={handleLinkedInConnect}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-[11px] hover:bg-blue-500 transition-colors"
                            >
                              OAuth
                            </button>
                          )}

                          {cap.platform === 'facebook' && (
                            <button
                              onClick={handleFacebookConnect}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-[11px] hover:bg-blue-500 transition-colors"
                            >
                              OAuth Pages
                            </button>
                          )}
                        </div>

                        <div>
                          {cap.publishing ? (
                            <button
                              onClick={() => setPublishPlatform(cap.platform)}
                              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-xs transition-all text-xs"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Publish Now</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setExportPlatform(cap.platform)}
                              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center gap-1.5 shadow-xs transition-all text-xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Export Package</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Credential Modal */}
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
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">API Key / Token / Secret</label>
                <input
                  type="password"
                  required
                  placeholder="Enter token or credential key..."
                  value={credValues.api_key || credValues.token || ''}
                  onChange={(e) => setCredValues({ api_key: e.target.value, token: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

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
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xs"
                >
                  {savingCred ? 'Encrypting...' : 'Save Credential'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Governed Publish Drawer */}
      {publishPlatform && (
        <PublishDrawer
          platform={publishPlatform}
          brandId={data?.brandId || 'brand_default'}
          onClose={() => setPublishPlatform(null)}
          onSuccess={fetchIntegrations}
        />
      )}

      {/* Export Package Drawer */}
      {exportPlatform && (
        <ExportPackageDrawer
          platform={exportPlatform}
          brandId={data?.brandId || 'brand_default'}
          onClose={() => setExportPlatform(null)}
        />
      )}

      {/* Potential Duplicates Review Modal */}
      {showDuplicatesModal && (
        <PotentialDuplicatesModal
          onClose={() => setShowDuplicatesModal(false)}
          onMerged={fetchIntegrations}
        />
      )}
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

'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Radio, CheckCircle2, AlertCircle, Key, Send, Download, GitMerge, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { connectorCapabilityRegistry, IntegrationGroup, ConnectorCapability } from '@/lib/connectors/connector-capability-registry';
import { PublishDrawer } from '@/components/integrations/publish-drawer';
import { ExportPackageDrawer } from '@/components/integrations/export-package-drawer';
import { PotentialDuplicatesModal } from '@/components/brands/potential-duplicates-modal';
import { useWorkspace } from '@/components/workspace-context';

function IntegrationsSettingsContent() {
  const { activeWorkspace } = useWorkspace();
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

  const fetchIntegrations = (wsId?: string) => {
    setLoading(true);
    const targetWs = wsId || activeWorkspace?.id || 'tenant-default';
    fetch(`/api/integrations?workspaceId=${targetWs}`)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchIntegrations(activeWorkspace?.id);

    const handleWorkspaceChanged = (e: any) => {
      fetchIntegrations(e.detail?.workspaceId);
    };

    window.addEventListener('workspace-changed', handleWorkspaceChanged);
    return () => {
      window.removeEventListener('workspace-changed', handleWorkspaceChanged);
    };
  }, [activeWorkspace?.id]);

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
          tenantId: activeWorkspace?.id || 'tenant-default',
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
        fetchIntegrations(activeWorkspace?.id);
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
          eyebrow={`Workspace: ${activeWorkspace?.name || 'Enterprise'}`}
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
            <Radio className="w-4 h-4 text-emerald-500" /> Publishing System Execution Mode ({activeWorkspace?.code})
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

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {cap.publishing && <Badge variant="slate">Publishing</Badge>}
                          {cap.analytics && <Badge variant="slate">Analytics</Badge>}
                          {cap.mediaUpload && <Badge variant="slate">Media</Badge>}
                          {cap.videoUpload && <Badge variant="slate">Video</Badge>}
                          {cap.carousel && <Badge variant="slate">Carousel</Badge>}
                          {cap.scheduling && <Badge variant="slate">Scheduling</Badge>}
                        </div>
                      </div>

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

      {/* Dynamic Credential Schema Modal */}
      {activeModalProvider && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-500" />
                <span>Configure {activeModalProvider.toUpperCase()} Integration</span>
              </h3>
              <button onClick={() => { setActiveModalProvider(null); setCredValues({}); }} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide mandatory API credentials required by the {activeModalProvider.toUpperCase()} connector schema for workspace {activeWorkspace?.name}. Secrets will be encrypted before storage.
            </p>

            <form onSubmit={handleSaveCredentialSubmit} className="space-y-4 text-xs">
              {(() => {
                const schemaMap: Record<string, { key: string; label: string; type: string; required: boolean; secret: boolean; helpText: string }[]> = {
                  linkedin: [
                    { key: 'client_id', label: 'Client / App ID', type: 'text', required: true, secret: false, helpText: 'Client ID from LinkedIn Developer Portal' },
                    { key: 'client_secret', label: 'Client Secret', type: 'password', required: true, secret: true, helpText: 'OAuth 2.0 Client Secret' },
                    { key: 'redirect_uri', label: 'Redirect URI', type: 'url', required: true, secret: false, helpText: 'Authorized redirect URL' },
                    { key: 'organization_id', label: 'Organization URN (Optional)', type: 'text', required: false, secret: false, helpText: 'urn:li:organization:12345' },
                  ],
                  facebook: [
                    { key: 'app_id', label: 'Meta App ID', type: 'text', required: true, secret: false, helpText: 'Meta Developer App ID' },
                    { key: 'app_secret', label: 'Meta App Secret', type: 'password', required: true, secret: true, helpText: 'Meta App Secret' },
                    { key: 'page_id', label: 'Facebook Page ID', type: 'text', required: true, secret: false, helpText: 'Facebook Page Numeric ID' },
                    { key: 'access_token', label: 'Page Access Token', type: 'password', required: true, secret: true, helpText: 'Long-lived Page Access Token' },
                  ],
                  instagram: [
                    { key: 'app_id', label: 'Meta App ID', type: 'text', required: true, secret: false, helpText: 'Meta App ID' },
                    { key: 'app_secret', label: 'Meta App Secret', type: 'password', required: true, secret: true, helpText: 'Meta App Secret' },
                    { key: 'instagram_account_id', label: 'Instagram Professional Account ID', type: 'text', required: true, secret: false, helpText: 'Connected Instagram Account ID' },
                    { key: 'access_token', label: 'Page / User Access Token', type: 'password', required: true, secret: true, helpText: 'Long-lived Access Token' },
                  ],
                  telegram: [
                    { key: 'bot_token', label: 'Telegram Bot Token', type: 'password', required: true, secret: true, helpText: 'Bot API Token from @BotFather' },
                    { key: 'chat_id', label: 'Chat / Channel ID', type: 'text', required: true, secret: false, helpText: 'Telegram Channel or Group ID' },
                  ],
                  youtube: [
                    { key: 'client_id', label: 'Google OAuth Client ID', type: 'text', required: true, secret: false, helpText: 'Google Cloud Console OAuth Client ID' },
                    { key: 'client_secret', label: 'Google OAuth Client Secret', type: 'password', required: true, secret: true, helpText: 'Google Cloud OAuth Secret' },
                    { key: 'channel_id', label: 'YouTube Channel ID', type: 'text', required: true, secret: false, helpText: 'YouTube Channel ID (e.g. UC...)' },
                  ],
                  x: [
                    { key: 'api_key', label: 'API Key (Consumer Key)', type: 'text', required: true, secret: false, helpText: 'X Developer Portal API Key' },
                    { key: 'api_secret', label: 'API Key Secret', type: 'password', required: true, secret: true, helpText: 'X Developer Portal API Secret' },
                    { key: 'bearer_token', label: 'Bearer Token', type: 'password', required: true, secret: true, helpText: 'v2 API Bearer Token' },
                  ],
                  wordpress: [
                    { key: 'site_url', label: 'WordPress Site URL', type: 'url', required: true, secret: false, helpText: 'e.g. https://blog.company.com' },
                    { key: 'username', label: 'WordPress Username / Email', type: 'text', required: true, secret: false, helpText: 'Authorized WordPress user login' },
                    { key: 'application_password', label: 'Application Password', type: 'password', required: true, secret: true, helpText: 'Generated Application Password' },
                  ],
                };

                const fields = schemaMap[activeModalProvider] || [
                  { key: 'api_key', label: 'API Key / Secret Token', type: 'password', required: true, secret: true, helpText: 'Authentication API key or secret token' },
                ];

                return fields.map((field) => (
                  <div key={field.key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.secret && (
                        <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded">
                          ENCRYPTED SECRET
                        </span>
                      )}
                    </div>
                    <input
                      type={field.secret ? 'password' : field.type === 'url' ? 'url' : 'text'}
                      required={field.required}
                      placeholder={field.helpText}
                      value={credValues[field.key] || ''}
                      onChange={(e) => setCredValues({ ...credValues, [field.key]: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <p className="text-[10px] text-slate-400">{field.helpText}</p>
                  </div>
                ));
              })()}

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    alert(`Testing connection to ${activeModalProvider.toUpperCase()} via health check...`);
                    try {
                      const res = await fetch('/api/credentials', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'test', category: 'social', provider: activeModalProvider, tenantId: activeWorkspace?.id }),
                      });
                      const data = await res.json();
                      alert(data.success ? `✓ Test Connection Successful! Account verified.` : `Connection Test Warning: ${data.message || data.error || 'Check credentials.'}`);
                    } catch {
                      alert('Connection test failed.');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                >
                  Test Connection
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setActiveModalProvider(null); setCredValues({}); }}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingCred}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm"
                  >
                    {savingCred ? 'Encrypting...' : 'Save Credential'}
                  </button>
                </div>
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
          onSuccess={() => fetchIntegrations(activeWorkspace?.id)}
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
          onMerged={() => fetchIntegrations(activeWorkspace?.id)}
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

'use client';

import React, { useEffect, useState } from 'react';
import {
  SlidersHorizontal,
  Sun,
  Moon,
  Globe,
  Building2,
  Cpu,
  Bell,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Loader2,
  ShieldCheck,
  Zap,
  DollarSign,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { useTheme } from '@/components/theme-provider';

export default function AdminPreferencesPage() {
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<
    'appearance' | 'regional' | 'workspace' | 'ai' | 'notifications'
  >('appearance');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Real confirmation modal state for switching to Real Provider mode
  const [showRealProviderConfirm, setShowRealProviderConfirm] = useState(false);
  const [pendingExecutionMode, setPendingExecutionMode] = useState<'mock' | 'real'>('mock');

  const [formData, setFormData] = useState({
    theme: 'system',
    density: 'comfortable',
    sidebarDefault: 'expanded',
    reducedMotion: false,

    timezone: 'UTC',
    locale: 'en-US',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    firstDayOfWeek: 'monday',

    defaultBrandId: '',
    defaultApprovalMode: 'APPROVAL_REQUIRED',
    defaultCalendarView: 'month',
    defaultLanguage: 'en-US',
    defaultReportingPeriod: '30d',

    allowedAiProvider: 'gemini',
    allowedDefaultTextModel: 'gemini-2.5-flash',
    allowedImageModel: 'imagen-3',
    executionMode: 'mock',
    fallbackBehavior: 'mock_fallback',
    costWarningThresholdUsd: 250,

    notifyApprovals: true,
    notifyFailures: true,
    notifyCredentialWarnings: true,
    notifyCampaignCompletion: true,
    notifyCostThreshold: true,
    notifyRiskEscalation: true,
  });

  const [initialData, setInitialData] = useState<any>(null);
  const [brands, setBrands] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/settings/preferences').then((res) => res.json()),
      fetch('/api/brands').then((res) => res.json()),
    ])
      .then(([prefs, brandsData]) => {
        if (prefs && !prefs.error) {
          const loaded = {
            theme: prefs.theme || 'system',
            density: prefs.density || 'comfortable',
            sidebarDefault: prefs.sidebarDefault || 'expanded',
            reducedMotion: Boolean(prefs.reducedMotion),

            timezone: prefs.timezone || 'UTC',
            locale: prefs.locale || 'en-US',
            dateFormat: prefs.dateFormat || 'YYYY-MM-DD',
            timeFormat: prefs.timeFormat || '24h',
            firstDayOfWeek: prefs.firstDayOfWeek || 'monday',

            defaultBrandId: prefs.defaultBrandId || '',
            defaultApprovalMode: prefs.defaultApprovalMode || 'APPROVAL_REQUIRED',
            defaultCalendarView: prefs.defaultCalendarView || 'month',
            defaultLanguage: prefs.defaultLanguage || 'en-US',
            defaultReportingPeriod: prefs.defaultReportingPeriod || '30d',

            allowedAiProvider: prefs.allowedAiProvider || 'gemini',
            allowedDefaultTextModel: prefs.allowedDefaultTextModel || 'gemini-2.5-flash',
            allowedImageModel: prefs.allowedImageModel || 'imagen-3',
            executionMode: prefs.executionMode || 'mock',
            fallbackBehavior: prefs.fallbackBehavior || 'mock_fallback',
            costWarningThresholdUsd: prefs.costWarningThresholdUsd ?? 250,

            notifyApprovals: prefs.notifyApprovals ?? true,
            notifyFailures: prefs.notifyFailures ?? true,
            notifyCredentialWarnings: prefs.notifyCredentialWarnings ?? true,
            notifyCampaignCompletion: prefs.notifyCampaignCompletion ?? true,
            notifyCostThreshold: prefs.notifyCostThreshold ?? true,
            notifyRiskEscalation: prefs.notifyRiskEscalation ?? true,
          };
          setFormData(loaded);
          setInitialData(loaded);
        }
        if (Array.isArray(brandsData)) {
          setBrands(brandsData);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    setSavedSuccess(false);
  };

  const handleExecutionModeToggle = (targetMode: 'mock' | 'real') => {
    if (targetMode === 'real' && formData.executionMode === 'mock') {
      setPendingExecutionMode('real');
      setShowRealProviderConfirm(true);
    } else {
      handleChange('executionMode', targetMode);
    }
  };

  const confirmRealProvider = () => {
    handleChange('executionMode', 'real');
    setShowRealProviderConfirm(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage('');
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/settings/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();

      if (res.ok) {
        setSavedSuccess(true);
        setHasUnsavedChanges(false);
        setInitialData(formData);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        setErrorMessage(resData.error || 'Failed to save admin preferences.');
      }
    } catch {
      setErrorMessage('Network error while saving preferences.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (initialData) {
      setFormData(initialData);
      setHasUnsavedChanges(false);
      setErrorMessage('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        eyebrow="System Configuration & Governance"
        title="Admin Preferences"
        description="Manage organization appearance, regional formatting, workspace defaults, allowed AI model providers, and notification alerts."
        actions={
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <button
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        }
      />

      {/* Notifications & Unsaved Changes Alert Bar */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Admin preferences updated successfully and saved to audit ledger.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Preferences Section Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
        {[
          { id: 'appearance', label: 'Appearance', icon: Sun },
          { id: 'regional', label: 'Regional & Calendar', icon: Globe },
          { id: 'workspace', label: 'Workspace Defaults', icon: Building2 },
          { id: 'ai', label: 'AI Execution', icon: Cpu },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Appearance */}
      {activeTab === 'appearance' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-indigo-500" />
              <span>Theme Mode</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Choose visual appearance theme across desktop and mobile.
            </p>
            <div className="grid grid-cols-3 gap-3 mt-3">
              {[
                { id: 'light', label: 'Light Theme', icon: Sun },
                { id: 'dark', label: 'Dark Theme', icon: Moon },
                { id: 'system', label: 'System Default', icon: SlidersHorizontal },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleChange('theme', item.id)}
                  className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    formData.theme === item.id
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50'
                  }`}
                >
                  <item.icon className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                Interface Density
              </label>
              <select
                value={formData.density}
                onChange={(e) => handleChange('density', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              >
                <option value="comfortable">Comfortable (Default spacing)</option>
                <option value="compact">Compact (High density data tables)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                Default Sidebar State
              </label>
              <select
                value={formData.sidebarDefault}
                onChange={(e) => handleChange('sidebarDefault', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              >
                <option value="expanded">Expanded Sidebar (Default)</option>
                <option value="collapsed">Collapsed Icon Sidebar</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Reduced Motion
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Disable decorative animations and subtle transitions.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.reducedMotion}
              onChange={(e) => handleChange('reducedMotion', e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Tab 2: Regional & Calendar */}
      {activeTab === 'regional' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                System Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">America/New_York (EST/EDT)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                Locale & Language
              </label>
              <select
                value={formData.locale}
                onChange={(e) => handleChange('locale', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              >
                <option value="en-US">English (United States) - en-US</option>
                <option value="en-GB">English (United Kingdom) - en-GB</option>
                <option value="es-ES">Spanish (Spain) - es-ES</option>
                <option value="de-DE">German (Germany) - de-DE</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                Date Formatting
              </label>
              <select
                value={formData.dateFormat}
                onChange={(e) => handleChange('dateFormat', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (US standard)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (EU standard)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                Time Formatting
              </label>
              <select
                value={formData.timeFormat}
                onChange={(e) => handleChange('timeFormat', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              >
                <option value="24h">24-hour clock (14:30)</option>
                <option value="12h">12-hour clock (2:30 PM)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Workspace Defaults */}
      {activeTab === 'workspace' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                Default Active Brand Profile
              </label>
              <select
                value={formData.defaultBrandId}
                onChange={(e) => handleChange('defaultBrandId', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              >
                <option value="">No Default (Prompt on launch)</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.industry})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                Default Approval Oversight Mode
              </label>
              <select
                value={formData.defaultApprovalMode}
                onChange={(e) => handleChange('defaultApprovalMode', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              >
                <option value="APPROVAL_REQUIRED">Approval Required (Mandatory Human Sign-off)</option>
                <option value="COPILOT">Copilot (Human Draft + AI Guidance)</option>
                <option value="RISK_BASED">Risk-Based Autonomy (Threshold score &gt; 90)</option>
                <option value="AUTONOMOUS">Autonomous (Pre-approved sandbox)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: AI Execution Preferences */}
      {activeTab === 'ai' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs">
          {/* Executive Notice */}
          <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-start gap-3">
            <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">
                Server-Side Provider Allowlist Enforced
              </span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Only server-approved providers and inference models are permitted. Sensitive API keys are managed safely via environment credentials (`GEMINI_API_KEY`, `OPENAI_API_KEY`) and are never exposed to client browsers.
              </p>
            </div>
          </div>

          {/* Execution Mode Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
              Execution Sandbox Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleExecutionModeToggle('mock')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  formData.executionMode === 'mock'
                    ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Mock Mode (Zero Cost Sandbox)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    SAFE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Deterministic local execution for standard demos, integration tests, and cost governance previews.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleExecutionModeToggle('real')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  formData.executionMode === 'real'
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Real Provider Mode
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    LIVE COST
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Incurs token costs using configured LLM API keys (`GEMINI_API_KEY` / `OPENAI_API_KEY`).
                </p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                Allowed AI Provider
              </label>
              <select
                value={formData.allowedAiProvider}
                onChange={(e) => handleChange('allowedAiProvider', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              >
                <option value="gemini">Google Gemini (Recommended)</option>
                <option value="openai">OpenAI GPT Architecture</option>
                <option value="mock">Local Mock Fallback Only</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                Allowed Text Generation Model
              </label>
              <select
                value={formData.allowedDefaultTextModel}
                onChange={(e) => handleChange('allowedDefaultTextModel', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast Enterprise Inference)</option>
                <option value="gpt-4o">OpenAI GPT-4o</option>
                <option value="mock-model">Mock Deterministic Engine</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                Allowed Visual / Image Model
              </label>
              <select
                value={formData.allowedImageModel}
                onChange={(e) => handleChange('allowedImageModel', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              >
                <option value="imagen-3">Google Imagen 3 High-Res</option>
                <option value="dall-e-3">OpenAI DALL-E 3</option>
                <option value="mock-image">Mock SVG Visual Generator</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                Cost Warning Alert Threshold ($ USD)
              </label>
              <input
                type="number"
                min={0}
                max={5000}
                value={formData.costWarningThresholdUsd}
                onChange={(e) => handleChange('costWarningThresholdUsd', Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                API Unavailability Fallback Strategy
              </label>
              <select
                value={formData.fallbackBehavior}
                onChange={(e) => handleChange('fallbackBehavior', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              >
                <option value="mock_fallback">Auto Fallback to Mock Engine (Zero Downtime)</option>
                <option value="error">Fail Fast with Error Exception</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Notifications */}
      {activeTab === 'notifications' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          {[
            { id: 'notifyApprovals', title: 'Content Approval Queue Requests', desc: 'Alert admins when content items require human review.' },
            { id: 'notifyFailures', title: 'Publishing Ledger Failures', desc: 'Alert when social connector publication attempts fail.' },
            { id: 'notifyCredentialWarnings', title: 'Connector Credential Expiration', desc: 'Warn when social API tokens expire within 7 days.' },
            { id: 'notifyCampaignCompletion', title: 'Campaign Execution Completion', desc: 'Notify upon final campaign post publication.' },
            { id: 'notifyCostThreshold', title: 'Cost Threshold Governance Alerts', desc: 'Notify when token cost consumption exceeds set limit.' },
            { id: 'notifyRiskEscalation', title: 'High-Risk Content Escalation', desc: 'Immediate notification when Quality Council blocks content.' },
          ].map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800/60"
            >
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  {item.title}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {item.desc}
                </span>
              </div>
              <input
                type="checkbox"
                checked={(formData as any)[item.id]}
                onChange={(e) => handleChange(item.id, e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal for Switching to Real Provider Mode */}
      {showRealProviderConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Confirm Switch to Real Provider Mode
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Operational Cost Confirmation
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Switching from <strong>Mock Mode</strong> to <strong>Real Provider Mode</strong> will direct AI agent requests to live inference APIs. Token usage costs will accumulate based on model pricing thresholds.
            </p>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
              Ensure proper API key quotas and cost alerts are configured before activating live inference.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRealProviderConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Keep Mock Mode
              </button>
              <button
                type="button"
                onClick={confirmRealProvider}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/30 transition-all"
              >
                Confirm Real Provider Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Megaphone,
  Check,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ShieldAlert,
  Bot,
  UserCheck,
  Zap,
  Calendar,
  Layers,
  Video,
  MessageSquare,
  Globe,
  Share2,
  FileCode,
  Lock,
  ExternalLink,
} from 'lucide-react';
import {
  CONNECTOR_CAPABILITIES,
  connectorCapabilityRegistry,
  PlatformId,
} from '@/lib/connectors/connector-capability-registry';
import { useWorkspace } from '@/components/workspace-context';

export default function NewCampaignWizardPage() {
  const router = useRouter();
  const { activeWorkspace } = useWorkspace();
  const [step, setStep] = useState(1);
  const [brands, setBrands] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    brandId: '',
    name: '',
    objective: 'webinar_registrations',
    productOrTopic: 'Autonomous Multi-Agent Content Operations for Enterprise',
    description: 'Global campaign positioning enterprise AI governance and brand safety.',
    targetAudience: 'CTOs, Chief Digital Officers, VPs of Marketing & Enterprise Architects',
    offerCTA: 'Register for the Live Multi-Agent Architecture Demo',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
    channels: ['linkedin', 'facebook', 'instagram', 'telegram'],
    textPostCount: 3,
    imageBriefCount: 2,
    carouselCount: 1,
    postingFrequency: 'daily',
    requiredMessages: 'Highlight multi-agent governance, brand safety, and measurable ROI.',
    prohibitedThemes: 'No political commentary or unverified claims.',
    groundingRequired: true,
    approvalRequired: true,
    oversightMode: 'APPROVAL_REQUIRED',
    autoSchedule: true,
  });

  const [submitting, setSubmitting] = useState(false);

  const [suggestions, setSuggestions] = useState<{
    offerings: string[];
    targetAudiences: string[];
    ctas: string[];
    pillars: string[];
  } | null>(null);

  const fetchBrands = (wsId?: string) => {
    const targetWs = wsId || activeWorkspace?.id || 'tenant-default';
    fetch(`/api/brands?workspaceId=${targetWs}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBrands(data);
          if (data.length > 0) {
            setFormData((prev) => ({
              ...prev,
              brandId: prev.brandId && data.some((b) => b.id === prev.brandId) ? prev.brandId : data[0].id,
            }));
          } else {
            setFormData((prev) => ({ ...prev, brandId: '' }));
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchBrands(activeWorkspace?.id);

    const handleWorkspaceChanged = (e: any) => {
      fetchBrands(e.detail?.workspaceId);
    };

    window.addEventListener('workspace-changed', handleWorkspaceChanged);
    return () => {
      window.removeEventListener('workspace-changed', handleWorkspaceChanged);
    };
  }, [activeWorkspace?.id]);

  useEffect(() => {
    if (!formData.brandId) {
      setSuggestions(null);
      return;
    }
    fetch(`/api/brands/${formData.brandId}/suggestions`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setSuggestions({
            offerings: data.offerings || [],
            targetAudiences: data.targetAudiences || [],
            ctas: data.ctas || [],
            pillars: data.pillars || [],
          });
          setFormData((prev) => ({
            ...prev,
            productOrTopic: data.defaultOffer || prev.productOrTopic,
            targetAudience: data.defaultAudience || prev.targetAudience,
            offerCTA: data.defaultCTA || prev.offerCTA,
            name: prev.name || (data.suggestedCampaignNames ? data.suggestedCampaignNames[0] : `${data.brandName || 'Enterprise'} Campaign`),
          }));
        }
      })
      .catch((err) => console.warn('Could not fetch brand suggestions:', err));
  }, [formData.brandId]);

  const handleChannelToggle = (channel: string) => {
    const current = formData.channels;
    if (current.includes(channel)) {
      if (current.length > 1) {
        setFormData({ ...formData, channels: current.filter((c) => c !== channel) });
      }
    } else {
      setFormData({ ...formData, channels: [...current, channel] });
    }
  };

  const handleSubmit = async () => {
    if (!formData.brandId) {
      alert('Please select or create a Brand Profile first.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          workspaceId: activeWorkspace?.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.id) {
        // Automatically trigger Strategy Agent generation
        await fetch(`/api/campaigns/${data.id}/generate-strategy`, { method: 'POST' });
        router.push(`/campaigns/${data.id}/strategy-preview`);
        router.refresh();
      } else {
        alert(data.error || 'Failed to create campaign');
        setSubmitting(false);
      }
    } catch {
      alert('Error submitting campaign wizard.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/campaigns" className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Multi-Step Campaign Wizard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Configure parameters for AI Multi-Agent strategy and content generation.</p>
        </div>
      </div>

      {/* Step Indicator Bar */}
      <div className="grid grid-cols-3 gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
        <div className={`p-2.5 rounded-xl flex items-center gap-2 font-semibold transition-all ${step === 1 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : step > 1 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</div>
          <span>1. Basics & Goal</span>
        </div>
        <div className={`p-2.5 rounded-xl flex items-center gap-2 font-semibold transition-all ${step === 2 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : step > 2 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</div>
          <span>2. Channels & Audience</span>
        </div>
        <div className={`p-2.5 rounded-xl flex items-center gap-2 font-semibold transition-all ${step === 3 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-400'}`}>
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</div>
          <span>3. Oversight & Autonomy</span>
        </div>
      </div>

      {/* Step 1: Basics & Objective */}
      {step === 1 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-indigo-500" /> Step 1: Campaign Basics & Goal
          </h2>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Brand Profile *</label>
              <Link href="/brands/new" className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                + Ingest Brand
              </Link>
            </div>
            {brands.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3">
                <span>No brands found in {activeWorkspace?.name || 'this workspace'}. Please create a Brand DNA profile first.</span>
                <Link href="/brands/new" className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-[11px] shrink-0 transition-colors">
                  Create Brand
                </Link>
              </div>
            ) : (
              <select
                value={formData.brandId}
                onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.industry})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Campaign Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Enterprise Multi-Agent Summit"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Primary Campaign Objective</label>
              <select
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="webinar_registrations">Webinar Registrations</option>
                <option value="qualified_leads">Qualified B2B Leads</option>
                <option value="awareness">Brand Awareness</option>
                <option value="engagement">Audience Engagement</option>
                <option value="event_attendance">Event Attendance</option>
                <option value="product_trial">Product Trial Signups</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Product, Service or Focus Topic *</label>
            <input
              type="text"
              required
              value={formData.productOrTopic}
              onChange={(e) => setFormData({ ...formData, productOrTopic: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
            {suggestions?.offerings && suggestions.offerings.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Suggested from Brand DNA:</span>
                {suggestions.offerings.map((offering) => (
                  <button
                    key={offering}
                    type="button"
                    onClick={() => setFormData({ ...formData, productOrTopic: offering })}
                    className={`px-2 py-0.5 rounded-lg border text-[11px] font-medium transition-all ${
                      formData.productOrTopic === offering
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-500'
                    }`}
                  >
                    + {offering}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Offer & Call To Action (CTA)</label>
            <input
              type="text"
              value={formData.offerCTA}
              onChange={(e) => setFormData({ ...formData, offerCTA: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
            {suggestions?.ctas && suggestions.ctas.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Suggested CTAs:</span>
                {suggestions.ctas.map((cta) => (
                  <button
                    key={cta}
                    type="button"
                    onClick={() => setFormData({ ...formData, offerCTA: cta })}
                    className={`px-2 py-0.5 rounded-lg border text-[11px] font-medium transition-all ${
                      formData.offerCTA === cta
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-500'
                    }`}
                  >
                    + {cta}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => {
                if (!formData.name || !formData.productOrTopic) {
                  alert('Please fill out Campaign Name and Product/Topic.');
                  return;
                }
                setStep(2);
              }}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>Next: Channels & Audience</span> <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Channels & Audience */}
      {step === 2 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" /> Step 2: Target Audience & Social Channels
          </h2>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Audience Description</label>
            <textarea
              rows={3}
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
            />
            {suggestions?.targetAudiences && suggestions.targetAudiences.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Suggested Audiences:</span>
                {suggestions.targetAudiences.map((aud) => (
                  <button
                    key={aud}
                    type="button"
                    onClick={() => setFormData({ ...formData, targetAudience: aud })}
                    className={`px-2 py-0.5 rounded-lg border text-[11px] font-medium transition-all ${
                      formData.targetAudience === aud
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-500'
                    }`}
                  >
                    + {aud.slice(0, 45)}...
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Target Channels & Platform Connectors ({formData.channels.length} Selected)
              </label>
              <Link
                href="/settings/integrations"
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                target="_blank"
              >
                <span>Manage API Connectors</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {connectorCapabilityRegistry.getAllCapabilities().map((connector) => {
                const isSelected = formData.channels.includes(connector.platform);

                // Derive publishing badge
                let publishBadge = { label: 'Direct Live', color: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300' };
                if (connector.status === 'EXPORT_ONLY') {
                  publishBadge = { label: 'Export Package', color: 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300' };
                } else if (connector.status === 'API_APPROVAL_REQUIRED') {
                  publishBadge = { label: 'Approval Required', color: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300' };
                } else if (connector.status === 'BETA') {
                  publishBadge = { label: 'Beta Direct', color: 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300' };
                }

                return (
                  <button
                    key={connector.platform}
                    type="button"
                    onClick={() => handleChannelToggle(connector.platform)}
                    className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/10 border-indigo-500 text-slate-900 dark:text-white font-semibold ring-1 ring-indigo-500/50 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs uppercase font-bold text-slate-900 dark:text-white">
                            {connector.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono border uppercase ${publishBadge.color}`}>
                            {publishBadge.label}
                          </span>
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                          }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-snug line-clamp-2">
                        {connector.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 pt-2.5 mt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{connector.group}</span>
                      <span>•</span>
                      <span>{connector.carousel ? 'Carousels' : connector.videoUpload ? 'Video' : 'Text/Images'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button onClick={() => setStep(1)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
              Back
            </button>
            <button onClick={() => setStep(3)} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30">
              <span>Next: Human Oversight & Autonomy</span> <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Oversight Modes & Auto-Schedule */}
      {step === 3 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-purple-500" /> Step 3: Human Oversight Modes & Auto-Scheduling
          </h2>

          {/* Oversight Mode Selection Grid */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Select Human Oversight & Governance Mode
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  id: 'COPILOT',
                  title: 'Copilot Mode',
                  icon: UserCheck,
                  color: 'text-blue-500',
                  desc: 'Interactive human-in-the-loop collaboration for every strategy edit and post approval.',
                },
                {
                  id: 'APPROVAL_REQUIRED',
                  title: 'Approval Required Mode',
                  icon: ShieldCheck,
                  color: 'text-purple-500',
                  desc: 'Full AI strategy and copy generation; all posts held in queue until explicit human review.',
                },
                {
                  id: 'RISK_BASED',
                  title: 'Risk-Based Autonomy',
                  icon: Zap,
                  color: 'text-amber-500',
                  desc: 'Auto-approves content with >90% compliance score; routes high-risk posts to human review.',
                },
                {
                  id: 'AUTONOMOUS',
                  title: 'Autonomous Campaign',
                  icon: Bot,
                  color: 'text-emerald-500',
                  desc: 'End-to-end autonomous strategy, content generation, market timing, and automated publishing.',
                },
              ].map((mode) => {
                const Icon = mode.icon;
                const isSelected = formData.oversightMode === mode.id;

                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, oversightMode: mode.id })}
                    className={`p-4 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-indigo-500/10 border-indigo-500 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${mode.color}`} />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{mode.title}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-500" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{mode.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Auto-Schedule Toggle */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  AI Market-Driven Auto-Scheduling
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Automatically schedule posts during peak engagement windows calculated by MarketResearchAgent.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.autoSchedule}
              onChange={(e) => setFormData({ ...formData, autoSchedule: e.target.checked })}
              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
            <button onClick={() => setStep(2)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:opacity-90"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? 'Orchestrating Multi-Agent Pipeline...' : 'Execute Multi-Agent Campaign Pipeline'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Megaphone, Check, Sparkles, ShieldCheck, ArrowRight, ShieldAlert, Bot, UserCheck, Zap, Calendar } from 'lucide-react';

export default function NewCampaignWizardPage() {
  const router = useRouter();
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

  useEffect(() => {
    fetch('/api/brands')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBrands(data);
          setFormData((prev) => ({ ...prev, brandId: data[0].id }));
        }
      });
  }, []);

  useEffect(() => {
    if (!formData.brandId) return;
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
    setSubmitting(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.id) {
        // Automatically trigger Strategy Agent generation
        await fetch(`/api/campaigns/${data.id}/generate-strategy`, { method: 'POST' });
        router.push(`/campaigns/${data.id}/strategy-preview`);
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
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Brand Profile *</label>
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
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">Select Target Social Channels</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'linkedin', label: 'LinkedIn', desc: 'Professional & Carousels' },
                { id: 'facebook', label: 'Facebook', desc: 'Pages & Link Previews' },
                { id: 'instagram', label: 'Instagram', desc: 'Visual Feed & Slides' },
                { id: 'telegram', label: 'Telegram', desc: 'Direct Channel Posts' },
              ].map((ch) => {
                const isSelected = formData.channels.includes(ch.id);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleChannelToggle(ch.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-600/10 border-indigo-500 text-slate-900 dark:text-white font-semibold'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-bold">{ch.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-500" />}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">{ch.desc}</span>
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

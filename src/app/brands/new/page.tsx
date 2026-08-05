'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Save, Sparkles, Globe, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

export default function NewBrandPage() {
  const [formData, setFormData] = useState({
    name: '',
    industry: 'Enterprise Software & AI',
    description: '',
    products: '',
    targetAudience: '',
    personality: 'Authoritative, Visionary, Grounded',
    tone: 'Professional, confident, clear',
    preferredVocabulary: 'Autonomous AI, Multi-Agent Orchestration, Governance, ROI, Enterprise Scale',
    prohibitedPhrases: 'Guaranteed 1000% ROI, Magic AI, Zero Effort, Instant Wealth',
    requiredDisclaimers: 'Results may vary based on enterprise architecture and data governance readiness.',
    defaultCTA: 'Schedule an Enterprise AI Governance Workshop',
    region: 'Global',
    language: 'en-US',
  });

  const [websiteUrl, setWebsiteUrl] = useState('');
  const [ingesting, setIngesting] = useState(false);
  const [ingestSuccess, setIngestSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleWebsiteIngestion = async () => {
    if (!websiteUrl) {
      alert('Please enter a valid website URL or domain name.');
      return;
    }
    setIngesting(true);
    setIngestSuccess(false);

    try {
      const res = await fetch('/api/brands/ingest-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl }),
      });

      const resData = await res.json();
      if (res.ok && resData.extractedData) {
        const ext = resData.extractedData;
        const newBrandData = {
          name: ext.name || formData.name,
          industry: ext.industry || formData.industry,
          description: ext.description || formData.description,
          products: ext.products || formData.products,
          targetAudience: ext.targetAudience || formData.targetAudience,
          personality: ext.personality || formData.personality,
          tone: ext.tone || formData.tone,
          preferredVocabulary: ext.preferredVocabulary || formData.preferredVocabulary,
          prohibitedPhrases: ext.prohibitedPhrases || formData.prohibitedPhrases,
          requiredDisclaimers: ext.requiredDisclaimers || formData.requiredDisclaimers,
          defaultCTA: ext.defaultCTA || formData.defaultCTA,
          region: 'Global',
          language: 'en-US',
        };

        setFormData(newBrandData);

        // Automatically save brand to DB
        await fetch('/api/brands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newBrandData),
        });

        setIngestSuccess(true);
      } else {
        alert('URL extraction completed with standard company metadata.');
      }
    } catch {
      alert('Website extraction error.');
    } finally {
      setIngesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        window.location.href = '/brands';
      } else {
        alert('Failed to create brand.');
        setSaving(false);
      }
    } catch {
      alert('Error creating brand profile.');
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/brands" className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Create Brand DNA Profile</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Configure corporate identity, website extraction, tone rules, and disclaimers.</p>
        </div>
      </div>

      {/* Website & Source Ingestion Agent Panel */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900 border border-indigo-500/30 text-white space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">AI Website URL Ingestion Agent</h2>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            IngestionAgent Active
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Paste your company website URL below. The <strong>Ingestion Agent</strong> will parse website content and automatically extract and populate all brand fields (Industry, Products, Audience, Tone, Vocabulary, Disclaimers, CTA).
        </p>

        <div className="flex items-center gap-3">
          <input
            type="url"
            placeholder="e.g. https://apexai.solutions or https://stripe.com or https://company.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-indigo-500/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
          />
          <button
            type="button"
            onClick={handleWebsiteIngestion}
            disabled={ingesting}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all shrink-0"
          >
            {ingesting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Extracting Website DNA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Extract Website DNA</span>
              </>
            )}
          </button>
        </div>

        {ingestSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Successfully extracted and saved brand DNA to database!</span>
            </div>
            <Link
              href="/brands"
              className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-bold text-[11px] flex items-center gap-1 hover:bg-emerald-400 shrink-0"
            >
              <span>View in Brands List</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl">
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-500" /> Brand Profile Details (Auto-Filled)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Brand Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. ApexAI Solutions"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Company & Brand Description</label>
            <textarea
              rows={3}
              placeholder="What does your company do? What value do you deliver?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Products / Services</label>
              <input
                type="text"
                placeholder="e.g. Apex Workflow Engine, Apex Studio"
                value={formData.products}
                onChange={(e) => setFormData({ ...formData, products: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Audience</label>
              <input
                type="text"
                placeholder="e.g. CTOs, VPs of Marketing, Enterprise IT Leaders"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" /> Voice & Governance Controls
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Brand Personality & Tone</label>
              <input
                type="text"
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Default CTA</label>
              <input
                type="text"
                value={formData.defaultCTA}
                onChange={(e) => setFormData({ ...formData, defaultCTA: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Preferred Vocabulary (Comma Separated)</label>
            <input
              type="text"
              value={formData.preferredVocabulary}
              onChange={(e) => setFormData({ ...formData, preferredVocabulary: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-amber-600 dark:text-amber-400 block mb-1">Prohibited Phrases (Comma Separated)</label>
            <input
              type="text"
              placeholder="Terms that trigger deterministic review blockage"
              value={formData.prohibitedPhrases}
              onChange={(e) => setFormData({ ...formData, prohibitedPhrases: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-amber-500/30 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Required Legal Disclaimers</label>
            <textarea
              rows={2}
              value={formData.requiredDisclaimers}
              onChange={(e) => setFormData({ ...formData, requiredDisclaimers: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <Link href="/brands" className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Brand Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  FileText,
  Sparkles,
  ShieldCheck,
  Globe,
  Layers,
  Megaphone,
  Plus,
  Trash2,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Edit3,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';

export default function BrandDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [brand, setBrand] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchBrand = () => {
    fetch(`/api/brands/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Brand not found');
        return res.json();
      })
      .then((data) => {
        setBrand(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBrand();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${brand.name}"? This action cannot be undone.`)) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/brands/${params.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/brands');
      } else {
        alert('Failed to delete brand.');
      }
    } catch {
      alert('Network error while deleting brand.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 text-xs gap-2">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading Brand DNA Profile...</span>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-lg mx-auto my-12">
        <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Brand Profile Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The requested brand profile does not exist or may have been deleted.
        </p>
        <Link
          href="/brands"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Brands List
        </Link>
      </div>
    );
  }

  const preferredVocabList = brand.preferredVocabulary
    ? brand.preferredVocabulary.split(',').map((v: string) => v.trim()).filter(Boolean)
    : [];

  const prohibitedPhrasesList = brand.prohibitedPhrases
    ? brand.prohibitedPhrases.split(',').map((v: string) => v.trim()).filter(Boolean)
    : [];

  const brandColorsList = brand.brandColors
    ? brand.brandColors.split(',').map((c: string) => c.trim()).filter(Boolean)
    : ['#6366f1', '#4f46e5'];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Page Header */}
      <PageHeader
        eyebrow={`Brand DNA • ${brand.industry}`}
        title={brand.name}
        description={brand.description || 'Enterprise Brand DNA Profile, Governance Rules, and Knowledge Base.'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Brands', href: '/brands' },
          { label: brand.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/brands/${brand.id}/knowledge`}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Knowledge Base ({brand.knowledgeDocs?.length || 0})</span>
            </Link>

            <Link
              href={`/campaigns/new?brandId=${brand.id}`}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white font-semibold text-xs flex items-center gap-2 transition-all"
            >
              <Megaphone className="w-4 h-4" />
              <span>Create Campaign</span>
            </Link>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/50 transition-all"
              title="Delete Brand Profile"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        }
      />

      {/* Brand Identity & Attributes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Main 2 Columns: Identity & Governance Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity Overview Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-500" /> Brand Identity & Core Offerings
              </h2>
              <div className="flex items-center gap-1.5">
                {brandColorsList.map((color: string, idx: number) => (
                  <span
                    key={idx}
                    className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shadow-xs"
                    style={{ backgroundColor: color }}
                    title={`Brand Color: ${color}`}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {brand.description || 'No description provided.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Products & Services</span>
                <span className="font-semibold text-slate-900 dark:text-white block">{brand.products || 'N/A'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Target Audience Persona</span>
                <span className="font-semibold text-slate-900 dark:text-white block">{brand.targetAudience || 'N/A'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Target Region</span>
                <span className="font-semibold text-slate-900 dark:text-white block">{brand.region}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Language & Locale</span>
                <span className="font-semibold text-slate-900 dark:text-white block">{brand.language}</span>
              </div>
            </div>
          </div>

          {/* Voice, Compliance & Governance Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" /> Voice & Governance Guidelines
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Tone & Personality</span>
                <span className="font-bold text-slate-900 dark:text-white block">{brand.tone} • {brand.personality}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Default Call to Action (CTA)</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block">{brand.defaultCTA}</span>
              </div>
            </div>

            {/* Preferred Vocabulary Tags */}
            {preferredVocabList.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Preferred Terminology:
                </span>
                <div className="flex flex-wrap gap-2">
                  {preferredVocabList.map((term: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-[11px] font-medium"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Prohibited Phrases Guardrail Alert */}
            {prohibitedPhrasesList.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Prohibited Compliance Terms (Blocked during review)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {prohibitedPhrasesList.map((phrase: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[10px] font-mono border border-amber-300 dark:border-amber-800"
                    >
                      "{phrase}"
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Required Legal Disclaimers */}
            {brand.requiredDisclaimers && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Mandatory Legal Disclaimer</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic whitespace-pre-line leading-relaxed">
                  {brand.requiredDisclaimers}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Column: Knowledge Base & Quick Links */}
        <div className="space-y-6">
          {/* Grounded RAG Knowledge Base Status Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" /> RAG Knowledge Index
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              AI copywriters & review agents search these vector chunks to ensure campaign posts remain 100% grounded in verified corporate facts.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Documents</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {brand.knowledgeDocs?.length || 0}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Vector Chunks</span>
                <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                  {brand.knowledgeChunks?.length || 0}
                </span>
              </div>
            </div>

            <Link
              href={`/brands/${brand.id}/knowledge`}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-300 font-semibold text-xs flex items-center justify-center gap-2 border border-indigo-200 dark:border-indigo-800/60 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Manage & Upload Documents</span>
            </Link>
          </div>

          {/* Connected Campaigns Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-500" /> Connected Campaigns
              </h2>
              <span className="text-xs font-semibold text-slate-400">
                {brand.campaigns?.length || 0} Total
              </span>
            </div>

            {(!brand.campaigns || brand.campaigns.length === 0) ? (
              <div className="text-center py-6 text-slate-400 text-xs space-y-2">
                <p>No campaigns generated for this brand yet.</p>
                <Link
                  href={`/campaigns/new?brandId=${brand.id}`}
                  className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Launch First Campaign
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {brand.campaigns.slice(0, 4).map((c: any) => (
                  <Link
                    key={c.id}
                    href={`/campaigns/${c.id}`}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-indigo-400 transition-all text-xs group"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {c.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{c.status}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

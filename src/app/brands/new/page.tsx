'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Save,
  Sparkles,
  Globe,
  Loader2,
  CheckCircle2,
  FileText,
  ShieldCheck,
  HelpCircle,
  X,
  RotateCcw,
} from 'lucide-react';
import {
  BrandDocumentUploader,
  UploadedFileItem,
} from '@/components/ui/brand-document-uploader';

export default function NewBrandPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  const [formData, setFormData] = useState({
    name: '',
    industry: 'Enterprise Software & AI',
    description: '',
    products: '',
    targetAudience: '',
    personality: 'Authoritative, Visionary, Grounded',
    tone: 'Professional, confident, clear',
    preferredVocabulary: '',
    prohibitedPhrases: '',
    requiredDisclaimers: '',
    defaultCTA: '',
    region: 'Global',
    language: 'en-US',
  });

  const [websiteUrl, setWebsiteUrl] = useState('');
  const [ingestingUrl, setIngestingUrl] = useState(false);
  const [ingestUrlSuccess, setIngestUrlSuccess] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState<string[]>([]);
  const [extractedIntelligence, setExtractedIntelligence] = useState<any>(null);
  const [evidenceModalField, setEvidenceModalField] = useState<{ fieldName: string; evidence: any } | null>(null);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState('');

  const handleWebsiteIngestion = async () => {
    if (!websiteUrl) {
      alert('Please enter a valid website URL or domain name.');
      return;
    }
    setIngestingUrl(true);
    setIngestUrlSuccess(false);
    setExtractionProgress([
      'Validating SSRF security bounds...',
      'Discovering website pages: Homepage, About, Products, Resources...',
      'Parsing metadata and HTML structure...',
      'Classifying brand voice & compliance disclaimers...',
      'Building structured Brand DNA...',
    ]);

    try {
      const res = await fetch('/api/brands/ingest-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl }),
      });

      const resData = await res.json();
      if (res.ok && resData.extractedData) {
        const ext = resData.extractedData;
        setFormData((prev) => ({
          ...prev,
          name: ext.name || prev.name,
          industry: ext.industry || prev.industry,
          description: ext.description || prev.description,
          products: ext.products || prev.products,
          targetAudience: ext.targetAudience || prev.targetAudience,
          personality: ext.personality || prev.personality,
          tone: ext.tone || prev.tone,
          preferredVocabulary: ext.preferredVocabulary || prev.preferredVocabulary,
          prohibitedPhrases: ext.prohibitedPhrases || prev.prohibitedPhrases,
          requiredDisclaimers: ext.requiredDisclaimers || prev.requiredDisclaimers,
          defaultCTA: ext.defaultCTA || prev.defaultCTA,
        }));

        setExtractedIntelligence(resData.intelligence);
        setIngestUrlSuccess(true);
        setExtractionProgress((prev) => [...prev, '✓ Complete! Brand DNA auto-populated.']);
      } else {
        alert(resData.error || 'Website extraction error.');
      }
    } catch {
      alert('Network error during website extraction.');
    } finally {
      setIngestingUrl(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!formData.name) {
      alert('Brand Name is required.');
      setCurrentStep(1);
      return;
    }

    setSubmitting(true);
    setSubmissionProgress('Creating Brand DNA Profile in database...');

    try {
      // Step A: Create Brand Record
      const brandRes = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!brandRes.ok) {
        throw new Error('Failed to create brand record.');
      }

      const brand = await brandRes.json();

      // Step B: Upload & Ingest Knowledge Documents for this Brand
      if (uploadedFiles.length > 0) {
        setSubmissionProgress(`Ingesting ${uploadedFiles.length} knowledge documents into RAG vector index...`);

        for (let i = 0; i < uploadedFiles.length; i++) {
          const item = uploadedFiles[i];
          const uploadData = new FormData();
          uploadData.append('file', item.file);
          uploadData.append('title', item.title || item.name);

          try {
            await fetch(`/api/brands/${brand.id}/knowledge`, {
              method: 'POST',
              body: uploadData,
            });
          } catch {
            console.error(`Failed to ingest document ${item.name}`);
          }
        }
      }

      setSubmissionProgress('Brand DNA Profile created successfully!');
      setTimeout(() => {
        router.push(`/brands/${brand.id}`);
      }, 800);
    } catch (err: any) {
      alert(err.message || 'Error creating Brand Profile.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/brands"
          className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Create Brand DNA Profile
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define corporate identity, voice rules, RAG knowledge documents, and disclaimers.
          </p>
        </div>
      </div>

      {/* 4-Step Wizard Stepper Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { step: 1, title: 'Identity', desc: 'Name & Industry' },
            { step: 2, title: 'Voice & Rules', desc: 'Tone & Disclaimers' },
            { step: 3, title: 'Knowledge', desc: 'Document Upload' },
            { step: 4, title: 'Review & Create', desc: 'Grounding Verification' },
          ].map((s) => (
            <button
              key={s.step}
              type="button"
              onClick={() => setCurrentStep(s.step as any)}
              className={`p-2.5 rounded-xl text-left border transition-all ${
                currentStep === s.step
                  ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 font-bold'
                  : currentStep > s.step
                  ? 'border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block leading-tight">
                Step 0{s.step}
              </span>
              <span className="text-xs font-semibold text-slate-900 dark:text-white block truncate">
                {s.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: BRAND IDENTITY */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Website URL Extractor Card */}
          <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-xl border border-slate-800 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  AI Website Intelligence Agent
                </h2>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 w-fit">
                website-brand-intelligence-agent
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Enter your corporate website URL. The <strong>Website Brand Intelligence Agent</strong> will safely crawl permitted public pages, extract structured Brand DNA intelligence, and provide evidence confidence scores.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="url"
                placeholder="e.g. https://stripe.com or https://apexai.solutions"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              />
              <button
                type="button"
                onClick={handleWebsiteIngestion}
                disabled={ingestingUrl}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition-all shrink-0"
              >
                {ingestingUrl ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Website DNA</span>
                  </>
                )}
              </button>
            </div>

            {/* Ingestion Stepper Log */}
            {extractionProgress.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-[11px] font-mono text-slate-300">
                {extractionProgress.map((line, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-indigo-400">&gt;</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            )}

            {ingestUrlSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Website Brand DNA auto-populated with evidence confidence scores.</span>
                </div>
                <span className="text-[10px] font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                  AI SUGGESTED
                </span>
              </div>
            )}
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" /> Basic Brand Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Brand Name *
                  </label>
                  {extractedIntelligence?.identity?.name && (
                    <button
                      type="button"
                      onClick={() => setEvidenceModalField({ fieldName: 'Brand Name', evidence: extractedIntelligence.identity.name })}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline font-mono"
                    >
                      <HelpCircle className="w-3 h-3" /> Why suggested?
                    </button>
                  )}
                </div>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Industry & Domain
                  </label>
                  {extractedIntelligence?.identity?.industry && (
                    <button
                      type="button"
                      onClick={() => setEvidenceModalField({ fieldName: 'Industry', evidence: extractedIntelligence.identity.industry })}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline font-mono"
                    >
                      <HelpCircle className="w-3 h-3" /> Why suggested?
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Company & Brand Overview
                </label>
                {extractedIntelligence?.identity?.description && (
                  <button
                    type="button"
                    onClick={() => setEvidenceModalField({ fieldName: 'Brand Overview', evidence: extractedIntelligence.identity.description })}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline font-mono"
                  >
                    <HelpCircle className="w-3 h-3" /> Why suggested?
                  </button>
                )}
              </div>
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
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Core Products / Offerings
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Workflow Engine, Apex Studio"
                  value={formData.products}
                  onChange={(e) => setFormData({ ...formData, products: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Audience Persona
                </label>
                <input
                  type="text"
                  placeholder="e.g. CTOs, VPs of Marketing, Enterprise IT Leads"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                if (!formData.name) {
                  alert('Please enter a Brand Name.');
                  return;
                }
                setCurrentStep(2);
              }}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              <span>Continue to Voice & Governance &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: VOICE & GOVERNANCE */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" /> Voice & Governance Rules
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Brand Personality & Tone
                </label>
                <input
                  type="text"
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Default Call-to-Action (CTA)
                </label>
                <input
                  type="text"
                  value={formData.defaultCTA}
                  onChange={(e) => setFormData({ ...formData, defaultCTA: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Preferred Vocabulary (Comma Separated)
              </label>
              <input
                type="text"
                value={formData.preferredVocabulary}
                onChange={(e) => setFormData({ ...formData, preferredVocabulary: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-amber-600 dark:text-amber-400 block mb-1">
                Prohibited Phrases (Triggers Compliance Blocking)
              </label>
              <input
                type="text"
                value={formData.prohibitedPhrases}
                onChange={(e) => setFormData({ ...formData, prohibitedPhrases: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-amber-500/30 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Mandatory Legal Disclaimers
              </label>
              <textarea
                rows={2}
                value={formData.requiredDisclaimers}
                onChange={(e) => setFormData({ ...formData, requiredDisclaimers: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              &larr; Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              <span>Continue to Knowledge Documents &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: KNOWLEDGE DOCUMENTS UPLOAD */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" /> RAG Knowledge Document Upload
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload corporate whitepapers, product documentation, tone guides, or PDF collateral. AI agents retrieve excerpts from these files to ground generated social campaigns in verified brand facts.
            </p>

            <BrandDocumentUploader
              files={uploadedFiles}
              onChange={setUploadedFiles}
            />
          </div>

          <div className="flex justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              &larr; Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              <span>Review & Create Brand DNA &rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & CREATE */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Review Brand DNA Summary
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Brand Name</span>
                <span className="font-bold text-slate-900 dark:text-white">{formData.name || 'N/A'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Industry</span>
                <span className="font-bold text-slate-900 dark:text-white">{formData.industry}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 md:col-span-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Personality & Tone</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{formData.tone}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 md:col-span-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Prohibited Phrases</span>
                <span className="font-mono text-amber-600 dark:text-amber-400">{formData.prohibitedPhrases}</span>
              </div>
            </div>

            {/* Prompt Injection Safeguard Banner */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Prompt-Injection & Security Isolation Active
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Uploaded documents are automatically wrapped in <code>&lt;untrusted_retrieved_document&gt;</code> tags. AI agents treat retrieved excerpts purely as source evidence and will ignore embedded instructions.
                </p>
              </div>
            </div>

            {submissionProgress && (
              <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs flex items-center gap-2 font-medium">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>{submissionProgress}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              &larr; Back
            </button>
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Processing Ingestion...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Create Brand Profile & Ingest</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Evidence Modal ("Why was this suggested?") */}
      {evidenceModalField && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                <span>AI Suggestion Evidence: {evidenceModalField.fieldName}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEvidenceModalField(null)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Extracted Value</span>
                <span className="font-bold text-slate-900 dark:text-white">{String(evidenceModalField.evidence.value)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Confidence Score</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {Math.round(evidenceModalField.evidence.confidence * 100)}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Method</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{evidenceModalField.evidence.extractionMethod}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Source Excerpt</span>
                <p className="text-slate-600 dark:text-slate-300 italic">{evidenceModalField.evidence.evidenceExcerpt}</p>
                <span className="text-[10px] text-indigo-500 font-mono block pt-1">{evidenceModalField.evidence.sourceUrl}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setEvidenceModalField(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Close Evidence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

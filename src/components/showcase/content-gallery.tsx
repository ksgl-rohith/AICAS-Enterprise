'use client';

import React, { useState } from 'react';
import {
  Linkedin,
  Instagram,
  Twitter,
  Layers,
  FileText,
  PieChart,
  Video,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

export function ContentGallerySection() {
  const [activeFormat, setActiveFormat] = useState<
    'linkedin' | 'instagram' | 'twitter' | 'carousel' | 'blog' | 'infographic' | 'video' | 'quote'
  >('linkedin');

  return (
    <section id="gallery" className="py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multimodal Output Gallery</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
          8 Enterprise Content Formats. Zero Quality Compromise.
        </h2>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          Inspect realistic multimodal assets produced by AICAS Enterprise—from structured text posts and Twitter threads to carousel slide decks and complete video packages.
        </p>
      </div>

      {/* Format Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-12">
        <button
          onClick={() => setActiveFormat('linkedin')}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeFormat === 'linkedin'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <Linkedin className="w-3.5 h-3.5" />
          <span>LinkedIn</span>
        </button>

        <button
          onClick={() => setActiveFormat('instagram')}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeFormat === 'instagram'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
              : 'bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <Instagram className="w-3.5 h-3.5" />
          <span>Instagram</span>
        </button>

        <button
          onClick={() => setActiveFormat('twitter')}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeFormat === 'twitter'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <Twitter className="w-3.5 h-3.5" />
          <span>X Thread</span>
        </button>

        <button
          onClick={() => setActiveFormat('carousel')}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeFormat === 'carousel'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Carousel</span>
        </button>

        <button
          onClick={() => setActiveFormat('blog')}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeFormat === 'blog'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Blog / Article</span>
        </button>

        <button
          onClick={() => setActiveFormat('infographic')}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeFormat === 'infographic'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>Infographic</span>
        </button>

        <button
          onClick={() => setActiveFormat('video')}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeFormat === 'video'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Video Script</span>
        </button>

        <button
          onClick={() => setActiveFormat('quote')}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeFormat === 'quote'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
              : 'bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Quote Card</span>
        </button>
      </div>

      {/* Gallery Output Preview Frame */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl">
        {/* LinkedIn Output */}
        {activeFormat === 'linkedin' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-blue-600" />
                LinkedIn Enterprise Post Output
              </span>
              <span className="text-emerald-700 font-mono font-semibold">Brand Score: 98/100</span>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-3 leading-relaxed">
              <p className="font-bold text-slate-900 text-sm">
                Single LLM prompts don't scale in enterprise production. Multi-agent orchestration is the real shift.
              </p>
              <p>
                When scaling social content operations across regulated global markets, relying on single generic prompts inevitably leads to brand voice drift and compliance risks.
              </p>
              <p className="font-semibold text-slate-900">Key Takeaways for CTOs:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-700">
                <li>Grounding AI in verified PDF whitepapers prevents factual hallucinations.</li>
                <li>Deterministic quality review council guarantees legal disclaimers.</li>
                <li>Idempotent API posting prevents duplicate cross-platform social publishing.</li>
              </ul>
              <p className="text-indigo-600 font-semibold pt-2">
                👉 Read the full Enterprise AI Architecture whitepaper: https://apexai.solutions/whitepaper
              </p>
              <p className="text-indigo-600 font-mono text-[11px]">
                #EnterpriseAI #MultiAgent #SoftwareArchitecture #TechnologyLeadership
              </p>
            </div>
          </div>
        )}

        {/* Instagram Output */}
        {activeFormat === 'instagram' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Simulated 1:1 Image Brief Visual */}
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-slate-200 p-6 flex flex-col justify-between text-slate-900 shadow-xs">
              <div className="flex justify-between items-center text-xs">
                <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur font-mono text-[10px] text-slate-700 border border-slate-200 font-semibold">
                  Aspect Ratio 1:1
                </span>
                <Sparkles className="w-4 h-4 text-pink-600" />
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                  AUTONOMOUS AGENTS IN ENTERPRISE
                </div>
                <p className="text-xs text-slate-600 font-mono">
                  Visual Prompt Specs: Clean dark mode 3D render, glowing purple neural mesh, glassmorphic floating cards.
                </p>
              </div>
              <div className="text-right text-[10px] text-slate-500 font-mono">ApexAI VisualAgent v2.5</div>
            </div>

            {/* Instagram Caption */}
            <div className="space-y-3 text-xs text-slate-800">
              <div className="flex items-center gap-2 text-pink-600 font-bold">
                <Instagram className="w-4 h-4" />
                Instagram Caption Output
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="font-semibold text-slate-900">
                  Is your marketing team drowning in repetitive copy edits? 💡
                </p>
                <p>
                  Discover how enterprise brands deploy multi-agent AI to automate campaign research, strategy generation, and quality review with 100% brand voice fidelity.
                </p>
                <p className="text-pink-600 font-mono text-[11px] pt-1">
                  #AIStrategy #EnterpriseTech #Automation #ContentOS #GrowthOps
                </p>
              </div>
            </div>
          </div>
        )}

        {/* X / Twitter Thread */}
        {activeFormat === 'twitter' && (
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-2">
                <Twitter className="w-4 h-4 text-sky-500" />
                Twitter / X 4-Tweet Sequence Output
              </span>
              <span className="text-sky-600 font-mono font-semibold">Thread Optimised</span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] font-bold text-sky-600">1/4 • The Hook</span>
                <p className="text-slate-900 font-semibold">
                  Why are 78% of enterprise social campaigns failing to maintain brand consistency? 🧵👇
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-500">2/4 • The Problem</span>
                <p className="text-slate-700">
                  Most teams rely on disconnected prompts across ChatGPT and Notion. This leads to brand voice drift, missing disclaimers, and human review bottlenecks.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-500">3/4 • The Solution</span>
                <p className="text-slate-700">
                  AICAS Enterprise introduces deterministic Quality Council gates scoring every tweet for factual risk, compliance, and originality before publishing.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] font-bold text-sky-600">4/4 • The Call to Action</span>
                <p className="text-slate-900 font-semibold">
                  Read our full engineering breakdown on multi-agent social orchestration: https://aicas.enterprise/docs 🚀
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Carousel Output */}
        {activeFormat === 'carousel' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Multi-Slide PDF / LinkedIn Carousel Specs
              </span>
              <span className="text-indigo-600 font-mono font-semibold">4 Slides Generated</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-indigo-600 font-mono">Slide 1 (Cover)</span>
                <h5 className="text-xs font-bold text-slate-900">5 Rules for Scaling Enterprise AI Content</h5>
                <p className="text-[10px] text-slate-500">Visual: Gradient mesh with bold white typography.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 font-mono">Slide 2 (Rule 1)</span>
                <h5 className="text-xs font-bold text-slate-900">Ground Copy in RAG Knowledge</h5>
                <p className="text-[10px] text-slate-500">Visual: Vector embeddings icon and PDF source chunk node.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 font-mono">Slide 3 (Rule 2)</span>
                <h5 className="text-xs font-bold text-slate-900">Enforce Deterministic Compliance</h5>
                <p className="text-[10px] text-slate-500">Visual: Quality Review Council score gauge at 98%.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-indigo-600 font-mono">Slide 4 (CTA)</span>
                <h5 className="text-xs font-bold text-slate-900">Deploy AICAS Enterprise Today</h5>
                <p className="text-[10px] text-slate-500">Visual: Platform logo & URL button callout.</p>
              </div>
            </div>
          </div>
        )}

        {/* Video Package Script Output */}
        {activeFormat === 'video' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-600" />
                Short-Form Video Package Script & Storyboard
              </span>
              <span className="text-emerald-700 font-mono font-semibold">Duration: 45 Seconds • Aspect: 9:16</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-emerald-700">Scene 1 (0-10s) • Hook</span>
                <p className="text-slate-900 font-semibold">"Is your team still writing social posts manually?"</p>
                <p className="text-[10px] text-slate-500">Visual: Rapid montage of marketer struggling with 20 tabs open.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-500">Scene 2 (10-30s) • Body</span>
                <p className="text-slate-700">"AICAS Enterprise coordinates 10 AI agents to generate, review, and schedule posts automatically."</p>
                <p className="text-[10px] text-slate-500">Visual: Sleek light mode dashboard overview animation.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-emerald-700">Scene 3 (30-45s) • CTA</span>
                <p className="text-slate-900 font-semibold">"Visit AICAS.enterprise to experience controlled autonomous AI."</p>
                <p className="text-[10px] text-slate-500">Thumbnail Prompt: Bold 3D glowing title card.</p>
              </div>
            </div>
          </div>
        )}

        {/* Fallback info for remaining formats */}
        {(activeFormat === 'blog' || activeFormat === 'infographic' || activeFormat === 'quote') && (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
            <span className="text-xs font-bold text-slate-900 block capitalize">{activeFormat} Output Specifications</span>
            <p>
              Generated using the Multimodal Copy and Visual Agents with structured JSON schema specifications ready for instant publishing or export.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

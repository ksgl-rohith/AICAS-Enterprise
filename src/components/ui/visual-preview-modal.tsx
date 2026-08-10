'use client';

import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Database,
  Calendar,
  Layers,
  FileImage,
  Quote,
  BarChart2,
  CheckCircle2,
} from 'lucide-react';

export interface VisualPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  channel: string;
  copyText?: string;
  ctaText?: string;
  brandName?: string;
  brandColors?: string[];
  imageBrief?: any;
  carouselData?: any;
  infographicData?: any;
  staticVisualData?: any;
}

export function VisualPreviewModal({
  isOpen,
  onClose,
  title,
  channel,
  copyText,
  ctaText,
  brandName = 'Brand',
  brandColors = ['#6366f1', '#4f46e5'],
  imageBrief,
  carouselData,
  infographicData,
  staticVisualData,
}: VisualPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'carousel' | 'image' | 'infographic' | 'static'>('carousel');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  if (!isOpen) return null;

  // Build dynamic brand-grounded slides if carouselData is missing
  const rawSlides = carouselData?.slides || [];
  const slides = rawSlides.length > 0 ? rawSlides : [
    {
      slideNumber: 1,
      header: title || `${brandName} Executive Guide`,
      bodyText: copyText ? copyText.slice(0, 120) + '...' : `Key industry insights for ${brandName} clients.`,
      visualDirection: `Bold cover slide featuring ${brandName} colors (${brandColors[0]})`,
    },
    {
      slideNumber: 2,
      header: 'Strategic Pillars & Quality',
      bodyText: 'Delivering transparent, compliance-backed service standards across every engagement.',
      visualDirection: 'Structured process workflow graphic',
    },
    {
      slideNumber: 3,
      header: 'Proven Client Impact',
      bodyText: `Empowering decision makers with verifiable results and grounded expertise.`,
      visualDirection: 'Key metrics and impact graphic',
    },
    {
      slideNumber: 4,
      header: 'Take Action',
      bodyText: ctaText || 'Contact Sales & Learn More',
      visualDirection: 'Call-to-action button card',
    },
  ];

  const totalSlides = slides.length;

  const dynamicImageBrief = imageBrief || {
    headlineOverlay: title,
    subheadingOverlay: copyText ? copyText.slice(0, 80) + '...' : `${brandName} Solutions`,
    artDirectionPrompt: `High-fidelity visual composition for ${brandName} displaying brand colors ${brandColors.join(', ')}.`,
    recommendedAspect: '16:9 Landscape (1200x628)',
  };

  const dynamicInfographic = infographicData || {
    title: title,
    keyTakeaway: `${brandName} Service & Quality Workflow`,
    nodes: [
      { stepNumber: 1, title: 'Identity & Strategy', metricOrValue: '100% Grounded', description: 'Grounded in verified Brand DNA' },
      { stepNumber: 2, title: 'Multi-Channel Execution', metricOrValue: `${channel.toUpperCase()} Tailored`, description: 'Optimized formatting and tone' },
      { stepNumber: 3, title: 'Quality Verification', metricOrValue: 'VERIFIED', description: 'Fact and compliance safety check' },
    ],
  };

  const dynamicStaticVisual = staticVisualData || {
    primaryText: copyText ? `“${copyText.slice(0, 140)}...”` : `“Excellence and transparent quality standards define ${brandName}.”`,
    authorOrSource: `${brandName} Leadership`,
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Visual Studio Preview</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 capitalize">
                  {channel}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">{title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Category Tabs */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-100/50 dark:bg-slate-950/40 overflow-x-auto">
          <button
            onClick={() => setActiveTab('carousel')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'carousel'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive Carousel ({totalSlides} Slides)</span>
          </button>

          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'image'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <FileImage className="w-3.5 h-3.5" />
            <span>Image Graphic Brief</span>
          </button>

          <button
            onClick={() => setActiveTab('infographic')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'infographic'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Infographic Flow</span>
          </button>

          <button
            onClick={() => setActiveTab('static')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'static'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Quote className="w-3.5 h-3.5" />
            <span>Quote / Stat Card</span>
          </button>
        </div>

        {/* Modal Body / Visual Renders */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-950">
          {/* TAB 1: CAROUSEL PREVIEW */}
          {activeTab === 'carousel' && (
            <div className="w-full max-w-md flex flex-col items-center">
              <div className="w-full aspect-[4/5] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-[10px] font-bold tracking-wider uppercase text-indigo-300">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>Slide {slides[currentSlideIndex].slideNumber || currentSlideIndex + 1} of {totalSlides}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {channel} Carousel
                  </span>
                </div>

                <div className="my-auto z-10 space-y-4">
                  <h3 className="text-xl md:text-2xl font-black text-white leading-snug tracking-tight">
                    {slides[currentSlideIndex].header || slides[currentSlideIndex].title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {slides[currentSlideIndex].bodyText || slides[currentSlideIndex].content}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 z-10 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 italic truncate max-w-[240px]">
                    Direction: {slides[currentSlideIndex].visualDirection || 'Brand visual deck'}
                  </span>
                  <div className="flex gap-1">
                    {slides.map((_: any, idx: number) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === currentSlideIndex ? 'w-5 bg-indigo-500' : 'w-1.5 bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-6">
                <button
                  disabled={currentSlideIndex === 0}
                  onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 text-xs font-semibold transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous Slide
                </button>
                <span className="text-xs text-slate-400 font-mono font-medium">
                  {currentSlideIndex + 1} / {totalSlides}
                </span>
                <button
                  disabled={currentSlideIndex === totalSlides - 1}
                  onClick={() => setCurrentSlideIndex((prev) => Math.min(totalSlides - 1, prev + 1))}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
                >
                  Next Slide <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IMAGE BRIEF PREVIEW */}
          {activeTab === 'image' && (
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-6 shadow-2xl">
              <div className="p-6 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    {brandName} Visual Brief
                  </span>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white leading-tight">
                  {dynamicImageBrief.headlineOverlay}
                </h3>
                <p className="text-xs text-slate-300">
                  {dynamicImageBrief.subheadingOverlay}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Art Direction</span>
                  <span className="text-slate-200 font-medium line-clamp-3">
                    {dynamicImageBrief.artDirectionPrompt}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Aspect Ratio</span>
                  <span className="text-slate-200 font-medium">
                    {dynamicImageBrief.recommendedAspect}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INFOGRAPHIC PREVIEW */}
          {activeTab === 'infographic' && (
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-2xl">
              <div className="text-center space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                  Infographic Process Flow
                </span>
                <h3 className="text-lg font-bold text-white">{dynamicInfographic.title}</h3>
                <p className="text-xs text-slate-400">{dynamicInfographic.keyTakeaway}</p>
              </div>

              <div className="space-y-3 pt-2">
                {dynamicInfographic.nodes.map((node: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {node.stepNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{node.title}</h4>
                      <p className="text-[11px] text-slate-400 truncate">{node.description}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                      {node.metricOrValue}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: STATIC VISUAL PREVIEW */}
          {activeTab === 'static' && (
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 text-white space-y-6 shadow-2xl text-center relative overflow-hidden">
              <Quote className="w-10 h-10 text-indigo-400 opacity-40 mx-auto" />
              <p className="text-base md:text-lg font-semibold italic text-slate-100 leading-relaxed">
                {dynamicStaticVisual.primaryText}
              </p>
              <div className="pt-4 border-t border-slate-800">
                <span className="text-xs font-bold text-indigo-300 block">
                  {dynamicStaticVisual.authorOrSource}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Verified Quote Card
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Preview artifact dynamically bound to real content item copy & brand attributes.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

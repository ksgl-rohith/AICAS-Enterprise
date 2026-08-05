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
} from 'lucide-react';

export interface VisualPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  channel: string;
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
  imageBrief,
  carouselData,
  infographicData,
  staticVisualData,
}: VisualPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'carousel' | 'infographic' | 'static'>('carousel');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  if (!isOpen) return null;

  // Defaults if data missing
  const slides = carouselData?.slides || [
    { slideNumber: 1, header: title, bodyText: 'Cover slide breakdown for enterprise audience.', visualDirection: 'Bold gradient cover slide' },
    { slideNumber: 2, header: 'Step 1: Grounded Ingestion', bodyText: 'Parse verified knowledge documents.', visualDirection: 'Vector data nodes' },
    { slideNumber: 3, header: 'Proven Impact', bodyText: '99.4% compliance risk reduction.', visualDirection: 'Metric stat bar' },
    { slideNumber: 4, header: 'Action Required', bodyText: 'Schedule live technical session.', visualDirection: 'CTA Button slide' },
  ];

  const totalSlides = slides.length;

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
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 capitalize">
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
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-900">
          {/* TAB 1: CAROUSEL PREVIEW */}
          {activeTab === 'carousel' && (
            <div className="w-full max-w-md flex flex-col items-center">
              {/* Carousel Slide Card Container */}
              <div className="w-full aspect-[4/5] bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Top Badge */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-[10px] font-bold tracking-wider uppercase text-indigo-300">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>Slide {slides[currentSlideIndex].slideNumber} of {totalSlides}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {channel} Carousel
                  </span>
                </div>

                {/* Slide Core Content */}
                <div className="my-auto z-10 space-y-4">
                  <h3 className="text-xl md:text-2xl font-black text-white leading-snug tracking-tight">
                    {slides[currentSlideIndex].header}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {slides[currentSlideIndex].bodyText}
                  </p>

                  {slides[currentSlideIndex].bulletPoints && (
                    <ul className="space-y-2 pt-2">
                      {slides[currentSlideIndex].bulletPoints.map((pt: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-indigo-200 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {slides[currentSlideIndex].highlightMetric && (
                    <div className="p-4 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-center">
                      <span className="text-2xl font-extrabold text-white block">
                        {slides[currentSlideIndex].highlightMetric}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-indigo-300 font-semibold">
                        Verified Metric Benchmark
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer Visual Direction Note */}
                <div className="pt-4 border-t border-slate-800 z-10 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 italic truncate max-w-[240px]">
                    Direction: {slides[currentSlideIndex].visualDirection}
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

              {/* Carousel Controls */}
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
            <div className="w-full max-w-lg bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-6 shadow-2xl">
              <div className="p-6 rounded-2xl bg-indigo-900/40 border border-indigo-500/30 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    {imageBrief?.previewVisualMock?.badge || 'Enterprise AI Graphic'}
                  </span>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white leading-tight">
                  {imageBrief?.headlineOverlay || title}
                </h3>
                <p className="text-xs text-slate-300">
                  {imageBrief?.subheadingOverlay || 'Powering compliance & growth at scale.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Art Direction</span>
                  <span className="text-slate-200 font-medium line-clamp-3">
                    {imageBrief?.artDirectionPrompt || '3D glassmorphic graphic displaying AI shield emblem and node graphs.'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Aspect Ratio</span>
                  <span className="text-slate-200 font-medium">
                    {imageBrief?.recommendedAspect || '16:9 Landscape (1200x628)'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INFOGRAPHIC PREVIEW */}
          {activeTab === 'infographic' && (
            <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-2xl">
              <div className="text-center space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                  Infographic Process Flow
                </span>
                <h3 className="text-lg font-bold text-white">{infographicData?.title || title}</h3>
                <p className="text-xs text-slate-400">{infographicData?.keyTakeaway || 'Key Process Milestones'}</p>
              </div>

              <div className="space-y-3 pt-2">
                {(infographicData?.nodes || [
                  { stepNumber: 1, title: 'Document Ingestion', metricOrValue: '100% Grounded', description: 'Parse verified knowledge documents' },
                  { stepNumber: 2, title: 'Multi-Agent Drafting', metricOrValue: '4 Channels', description: 'Synchronized copy generation' },
                  { stepNumber: 3, title: 'Review & Safety', metricOrValue: '<150ms Latency', description: 'Check tone and compliance rules' },
                ]).map((node: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-900 border border-slate-800">
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
            <div className="w-full max-w-md bg-gradient-to-b from-purple-950 via-slate-950 to-slate-900 border border-purple-500/30 rounded-3xl p-8 text-white space-y-6 shadow-2xl text-center relative overflow-hidden">
              <Quote className="w-10 h-10 text-purple-400 opacity-40 mx-auto" />
              <p className="text-base md:text-lg font-semibold italic text-slate-100 leading-relaxed">
                {staticVisualData?.primaryText || '“Deploying multi-agent AI governance is the highest leverage capability for enterprise marketing.”'}
              </p>
              <div className="pt-4 border-t border-purple-500/20">
                <span className="text-xs font-bold text-purple-300 block">
                  {staticVisualData?.authorOrSource || 'Executive AI Insights'}
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
            Preview artifact generated by Visual AI Agents Council
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

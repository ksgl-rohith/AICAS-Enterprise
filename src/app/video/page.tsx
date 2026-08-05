'use client';

import React, { useState } from 'react';
import { Video, Play, Smartphone } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';

export default function VideoPage() {
  const [pkg] = useState({
    hook: 'Stop building single-prompt AI wrappers in enterprise production.',
    durationSec: 15,
    aspectRatios: ['9:16', '1:1', '16:9'],
    renderingStatus: 'PREVIEW_GENERATED',
    onScreenText: 'Multi-Agent AI Governance for Enterprise SaaS | AICAS Enterprise',
    voiceoverText: 'Why single LLM prompts fail enterprise brand safety. Discover multi-agent governance.',
    scenes: [
      { num: 1, dur: 3, visual: 'Animated code terminal showing prompt failure alert.', audio: 'Why single LLM prompts fail brand safety.' },
      { num: 2, dur: 8, visual: 'Quality Council agent architecture diagram.', audio: 'Enterprise platforms require multi-agent factual verification.' },
      { num: 3, dur: 4, visual: 'AICAS dashboard CTA banner.', audio: 'Schedule your enterprise AI audit today.' },
    ],
    safeArea: 'Keep hook title inside central 80% box for TikTok/Reels overlays.',
    accessibility: 'Captions included with high contrast box for WCAG 2.1 AA compliance.',
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Content Operations"
        title="Short-Form Video Package Preview & Inspector"
        description="Structured short-form video package generation, storyboards, caption alignment, safe areas, and rendering preview."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Content Operations' },
          { label: 'Video Packages' },
        ]}
        actions={
          <Badge variant="indigo" icon={<Video className="w-3.5 h-3.5" />}>
            Status: {pkg.renderingStatus}
          </Badge>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Scene Sequence & Storyboard */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Scene Sequence & Storyboard Breakdown</h2>

            <div className="space-y-3 text-xs">
              {pkg.scenes.map((scene) => (
                <div key={scene.num} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">Scene {scene.num} ({scene.dur}s)</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Duration: {scene.dur} seconds</span>
                  </div>
                  <div className="space-y-1">
                    <strong className="text-slate-900 dark:text-white block">Visual Direction:</strong>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{scene.visual}</p>
                  </div>
                  <div className="space-y-1">
                    <strong className="text-purple-600 dark:text-purple-300 block">Audio / Voiceover Script:</strong>
                    <p className="text-slate-800 dark:text-slate-200 font-mono">"{scene.audio}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Video Preview Mock Frame */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-purple-600 dark:text-purple-400" /> 9:16 Mobile Preview
            </h2>

            {/* Mobile Video Frame Simulation */}
            <div className="relative aspect-[9/16] rounded-2xl bg-slate-900 border-2 border-indigo-500/30 overflow-hidden flex flex-col justify-between p-4 text-center">
              <div className="pt-8">
                <span className="bg-red-600 text-white font-bold text-[10px] uppercase px-2 py-1 rounded shadow">
                  Hook Title
                </span>
                <h3 className="text-white font-bold text-sm mt-2">{pkg.hook}</h3>
              </div>

              <div className="py-6 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-indigo-500 transition-all">
                  <Play className="w-6 h-6 ml-0.5" />
                </div>
                <span className="text-[10px] text-slate-400 mt-2 font-mono">Preview rendering generated</span>
              </div>

              <div className="pb-4 space-y-1 bg-slate-950/90 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[9px] text-indigo-400 uppercase font-bold block">On-Screen Caption Overlay</span>
                <p className="text-[11px] text-white font-medium">{pkg.voiceoverText}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
              <strong className="text-slate-800 dark:text-slate-200 block">Safe-Area Instructions:</strong>
              <p className="text-slate-600 dark:text-slate-400">{pkg.safeArea}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

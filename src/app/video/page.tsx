'use client';

import React, { useState } from 'react';
import { Video, Play, FileText, CheckCircle2, Smartphone, Monitor, ShieldCheck } from 'lucide-react';

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-400" /> Short-Form Video Package Preview & Inspector
          </h1>
          <p className="text-xs text-slate-400">
            Structured short-form video package generation, storyboards, caption alignment, safe areas, and rendering preview.
          </p>
        </div>

        <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          Status: {pkg.renderingStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Scene Sequence & Storyboard */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white">Scene Sequence & Storyboard Breakdown</h2>

            <div className="space-y-3 text-xs">
              {pkg.scenes.map((scene) => (
                <div key={scene.num} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-400 uppercase">Scene {scene.num} ({scene.dur}s)</span>
                    <span className="text-[10px] text-slate-500 font-mono">Duration: {scene.dur} seconds</span>
                  </div>
                  <div className="space-y-1">
                    <strong className="text-white block">Visual Direction:</strong>
                    <p className="text-slate-300">{scene.visual}</p>
                  </div>
                  <div className="space-y-1">
                    <strong className="text-purple-300 block">Audio / Voiceover Script:</strong>
                    <p className="text-slate-200 font-mono">"{scene.audio}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Video Preview Mock Frame */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-purple-400" /> 9:16 Mobile Preview
            </h2>

            {/* Mobile Video Frame Simulation */}
            <div className="relative aspect-[9/16] rounded-2xl bg-slate-950 border-2 border-indigo-500/30 overflow-hidden flex flex-col justify-between p-4 text-center">
              <div className="pt-8">
                <span className="bg-red-600/90 text-white font-bold text-[10px] uppercase px-2 py-1 rounded shadow">
                  Hook Title
                </span>
                <h3 className="text-white font-bold text-sm mt-2">{pkg.hook}</h3>
              </div>

              <div className="py-6 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-indigo-600/80 flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-indigo-500">
                  <Play className="w-6 h-6 ml-0.5" />
                </div>
                <span className="text-[10px] text-slate-400 mt-2 font-mono">Preview rendering generated</span>
              </div>

              <div className="pb-4 space-y-1 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[9px] text-indigo-400 uppercase font-bold block">On-Screen Caption Overlay</span>
                <p className="text-[11px] text-white font-medium">{pkg.voiceoverText}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1">
              <strong className="text-slate-300 block">Safe-Area Instructions:</strong>
              <p className="text-slate-400">{pkg.safeArea}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

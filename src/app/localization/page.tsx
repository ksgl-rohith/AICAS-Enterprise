'use client';

import React, { useState } from 'react';
import { Globe, Languages, ShieldCheck, GitCommit } from 'lucide-react';

export default function LocalizationPage() {
  const [items] = useState([
    {
      id: 'loc_01',
      sourceContentId: 'item_saas_001',
      sourceLocale: 'en-US',
      targetLocale: 'es-ES',
      translatedBody: '5 Puntos de Control de Gobernanza de IA antes de publicar contenido en SaaS empresarial.',
      translatedCTA: 'Programe una auditoría de gobernanza de IA empresarial.',
      transcreationNotes: 'Transcreated technical phrasing for Spanish corporate audience.',
      policyValidationStatus: 'PASSED',
      isCulturallySensitive: false,
    },
    {
      id: 'loc_02',
      sourceContentId: 'item_saas_001',
      sourceLocale: 'en-US',
      targetLocale: 'de-DE',
      translatedBody: '5 KI-Governance-Prüfpunkte vor der Veröffentlichung von KI-Inhalten im Enterprise SaaS.',
      translatedCTA: 'Buchen Sie ein Enterprise KI-Governance-Audit.',
      transcreationNotes: 'Adapted tone for German enterprise compliance standards.',
      policyValidationStatus: 'PASSED',
      isCulturallySensitive: false,
    },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-400" /> Localization & Transcreation Management
        </h1>
        <p className="text-xs text-slate-400">
          Source-to-localized content lineage, transcreation adaptation, locale policy validation, and disclaimer preservation.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Languages className="w-4 h-4 text-indigo-400" /> Localized Content Lineage & Adaptations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {items.map((item) => (
            <div key={item.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white uppercase">{item.targetLocale}</span>
                  <span className="text-[10px] text-slate-400">From {item.sourceLocale}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {item.policyValidationStatus}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Localized Body</span>
                <p className="text-slate-200">{item.translatedBody}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Localized CTA</span>
                <p className="text-indigo-300 font-bold">{item.translatedCTA}</p>
              </div>

              <div className="p-2.5 rounded bg-slate-900 text-slate-400 text-[11px]">
                <strong>Transcreation Note:</strong> {item.transcreationNotes}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

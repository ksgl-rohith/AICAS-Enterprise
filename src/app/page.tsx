import React from 'react';
import { ParticleBackground } from '@/components/showcase/particle-background';
import { ShowcaseNav } from '@/components/showcase/showcase-nav';
import { HeroSection } from '@/components/showcase/hero';
import { ProductOverviewSection } from '@/components/showcase/product-overview';
import { AppWalkthroughSection } from '@/components/showcase/app-walkthrough';
import { FeatureShowcaseSection } from '@/components/showcase/feature-showcase';
import { ContentGallerySection } from '@/components/showcase/content-gallery';
import { AgentShowcaseSection } from '@/components/showcase/agent-showcase';
import { EnterpriseWorkflowSection } from '@/components/showcase/enterprise-workflow';
import { AnalyticsShowcaseSection } from '@/components/showcase/analytics-showcase';
import { PublishingShowcaseSection } from '@/components/showcase/publishing-showcase';
import { TechArchitectureSection } from '@/components/showcase/tech-architecture';
import { WhyEnterprisesSection } from '@/components/showcase/why-enterprises';
import { LiveProductPreviewSection } from '@/components/showcase/live-product-preview';
import { FinalCTASection } from '@/components/showcase/final-cta';
import Link from 'next/link';
import { Bot } from 'lucide-react';

export default function ShowcasePage() {
  return (
    <div className="relative min-h-screen bg-white text-slate-900 selection:bg-indigo-500 selection:text-white font-sans overflow-x-hidden">
      {/* Background Interactive Particle Canvas */}
      <ParticleBackground />

      {/* Floating Glass Top Navigation Header */}
      <ShowcaseNav />

      {/* Main Content Assembly */}
      <main className="relative z-10 space-y-12">
        {/* Section 1: Hero */}
        <HeroSection />

        {/* Section 2: Product Overview */}
        <ProductOverviewSection />

        {/* Section 3: Application Walkthrough */}
        <AppWalkthroughSection />

        {/* Section 4: Feature Showcase */}
        <FeatureShowcaseSection />

        {/* Section 5: Content Generation Gallery */}
        <ContentGallerySection />

        {/* Section 6: AI Agent Showcase */}
        <AgentShowcaseSection />

        {/* Section 7: Enterprise Workflow */}
        <EnterpriseWorkflowSection />

        {/* Section 8: Analytics Showcase */}
        <AnalyticsShowcaseSection />

        {/* Section 9: Publishing Showcase */}
        <PublishingShowcaseSection />

        {/* Section 10: Enterprise Technology Architecture */}
        <TechArchitectureSection />

        {/* Section 11: Why Enterprises Choose AICAS */}
        <WhyEnterprisesSection />

        {/* Section 12: Live Product Preview */}
        <LiveProductPreviewSection />

        {/* Section 13: Final CTA */}
        <FinalCTASection />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block">AICAS Enterprise</span>
              <span className="text-[10px] text-slate-500 font-medium">Autonomous Multi-Agent Content Operating System</span>
            </div>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
              Launch Application
            </Link>
            <Link href="/brands" className="hover:text-indigo-600 transition-colors">
              Brand Profiles
            </Link>
            <Link href="/campaigns" className="hover:text-indigo-600 transition-colors">
              Campaign Wizard
            </Link>
            <Link href="/approvals" className="hover:text-indigo-600 transition-colors">
              Quality Council
            </Link>
            <Link href="/analytics" className="hover:text-indigo-600 transition-colors">
              Analytics
            </Link>
          </div>

          <div className="text-right text-[10px] text-slate-500 font-mono">
            © 2026 AICAS Enterprise. All rights reserved. • Controlled Autonomy Mode Active
          </div>
        </div>
      </footer>
    </div>
  );
}

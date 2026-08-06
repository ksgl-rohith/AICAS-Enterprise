'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bot, ArrowRight, Sparkles, ShieldCheck, Menu, X } from 'lucide-react';

export function ShowcaseNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Overview', href: '#overview' },
    { name: 'Walkthrough', href: '#walkthrough' },
    { name: 'Features', href: '#features' },
    { name: 'Outputs', href: '#gallery' },
    { name: 'AI Agents', href: '#agents' },
    { name: 'Workflow', href: '#workflow' },
    { name: 'Architecture', href: '#architecture' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-xs py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Bot className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                AICAS <span className="text-indigo-600 font-normal">Enterprise</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-widest hidden sm:inline-block">
                v2.5
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium hidden md:block">
              Autonomous Multi-Agent Content OS
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="hover:text-indigo-600 transition-colors duration-150 relative py-1 hover:after:w-full after:w-0 after:h-0.5 after:bg-indigo-600 after:absolute after:bottom-0 after:left-0 after:transition-all after:duration-200"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>Gemini 2.5 Flash</span>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all group"
          >
            <span>Launch Application</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-2xl border-b border-slate-200 px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200 shadow-xl">
          <div className="flex flex-col space-y-3 text-sm font-semibold text-slate-700">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-indigo-600 py-1 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-600 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Controlled Autonomy
            </span>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
            >
              Enter Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

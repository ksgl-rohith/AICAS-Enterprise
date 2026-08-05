'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, ArrowRight, ShieldCheck, Sparkles, User, Lock, Mail, Key, UserCheck } from 'lucide-react';
import { useAuth } from '@/components/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login, signup } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  // Form inputs
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin@123');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const success = login(username, password);
    if (success) {
      router.push('/dashboard');
    } else {
      setErrorMsg('Invalid login credentials. Default Admin: admin / admin@123');
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !username || !password) {
      setErrorMsg('Please fill out all required fields.');
      return;
    }

    const success = signup(name, email, username, password);
    if (success) {
      router.push('/dashboard');
    } else {
      setErrorMsg('Sign up failed. Please check inputs.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-center transition-all">
        {/* Brand Icon Header */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
          <Bot className="w-9 h-9" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">AICAS Enterprise OS</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Autonomous Multi-Agent Content Intelligence & Governance Platform
          </p>
        </div>

        {/* Login / Signup Tabs */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => { setTab('login'); setErrorMsg(''); }}
            className={`py-2 rounded-xl transition-all ${
              tab === 'login'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('signup'); setErrorMsg(''); }}
            className={`py-2 rounded-xl transition-all ${
              tab === 'signup'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* TAB 1: LOGIN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="admin@123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Admin Credentials Quick Auto-Fill Banner */}
            <div
              onClick={() => { setUsername('admin'); setPassword('admin@123'); }}
              className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 cursor-pointer hover:border-indigo-500 transition-all flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-semibold">
                <Key className="w-3.5 h-3.5 text-indigo-500" />
                <span>Default Admin Credentials:</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                admin / admin@123
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <span>Sign In to Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 2: SIGNUP FORM */}
        {tab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Alex Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Username *
              </label>
              <input
                type="text"
                required
                placeholder="alexvance"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Corporate Email
              </label>
              <input
                type="email"
                placeholder="alex@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>Register & Access OS</span>
            </button>
          </form>
        )}

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
          Role governance mode: Standard Users log in as <strong className="text-slate-600 dark:text-slate-200">USER</strong> role; Default Admin logs in as <strong className="text-purple-600 dark:text-purple-400">ADMIN</strong>.
        </div>
      </div>
    </div>
  );
}

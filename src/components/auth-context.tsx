'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  username: string;
  role: 'ADMIN' | 'USER' | 'MARKETING_MANAGER' | string;
  avatarUrl?: string | null;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  isAdmin: boolean;
  login: (identifier: string, passwordInput: string, remember?: boolean) => Promise<AuthResponse>;
  signup: (
    name: string,
    email: string,
    password: string,
    confirmPassword?: string,
    workspaceData?: { workspaceName?: string; industry?: string; website?: string; companySize?: string }
  ) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (
    identifier: string,
    passwordInput: string,
    remember: boolean = false
  ): Promise<AuthResponse> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password: passwordInput, remember }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        return { success: true };
      }
      return {
        success: false,
        error: data.error || 'Invalid email or password.',
      };
    } catch {
      return {
        success: false,
        error: 'Unable to sign in right now. Please check your network connection.',
      };
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    confirmPassword?: string,
    workspaceData?: { workspaceName?: string; industry?: string; website?: string; companySize?: string }
  ): Promise<AuthResponse> => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          workspaceName: workspaceData?.workspaceName,
          industry: workspaceData?.industry,
          website: workspaceData?.website,
          companySize: workspaceData?.companySize,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        return { success: true };
      }
      return {
        success: false,
        error: data.error || 'Registration failed. Please check your details.',
      };
    } catch {
      return {
        success: false,
        error: 'Unable to create account right now. Please try again.',
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network error on logout
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, signup, logout, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

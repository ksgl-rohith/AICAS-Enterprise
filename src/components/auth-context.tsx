'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  username: string;
  role: 'ADMIN' | 'USER';
  avatarUrl?: string;
}

interface AuthContextType {
  user: UserSession | null;
  isAdmin: boolean;
  login: (username: string, password: string) => boolean;
  signup: (name: string, email: string, username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedUser = localStorage.getItem('aicas_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Replace legacy Alex Vance with AICAS TEAM if stored
        if (parsed.name && parsed.name.includes('Alex Vance')) {
          parsed.name = 'AICAS TEAM';
        }
        setUser(parsed);
      } catch {
        setUser(null);
      }
    } else {
      const defaultAdmin: UserSession = {
        id: 'user_admin',
        name: 'AICAS TEAM',
        email: 'admin@aicas.ai',
        username: 'admin',
        role: 'ADMIN',
      };
      setUser(defaultAdmin);
      localStorage.setItem('aicas_user', JSON.stringify(defaultAdmin));
    }
    setLoading(false);
  }, []);

  const login = (usernameInput: string, passwordInput: string): boolean => {
    const u = usernameInput.trim();
    const p = passwordInput.trim();

    // Check default Admin credentials
    if ((u === 'admin' || u === 'admin@aicas.ai') && p === 'admin@123') {
      const adminUser: UserSession = {
        id: 'user_admin',
        name: 'AICAS TEAM',
        email: 'admin@aicas.ai',
        username: 'admin',
        role: 'ADMIN',
      };
      setUser(adminUser);
      localStorage.setItem('aicas_user', JSON.stringify(adminUser));
      return true;
    }

    // Standard user login simulation
    if (p.length >= 4) {
      const standardUser: UserSession = {
        id: `user_${Date.now()}`,
        name: u.split('@')[0] || u,
        email: u.includes('@') ? u : `${u}@aicas.ai`,
        username: u,
        role: 'USER',
      };
      setUser(standardUser);
      localStorage.setItem('aicas_user', JSON.stringify(standardUser));
      return true;
    }

    return false;
  };

  const signup = (name: string, email: string, username: string, password: string): boolean => {
    if (!name || !username || password.length < 4) return false;
    
    const newUser: UserSession = {
      id: `user_${Date.now()}`,
      name,
      email: email || `${username}@aicas.ai`,
      username,
      role: 'USER',
    };
    setUser(newUser);
    localStorage.setItem('aicas_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aicas_user');
    router.push('/login');
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, signup, logout }}>
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

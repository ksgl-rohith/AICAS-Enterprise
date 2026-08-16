'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-context';

export interface Workspace {
  id: string;
  name: string;
  code: string;
  description: string;
  role: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  loading: boolean;
  switchWorkspace: (workspaceId: string) => Promise<boolean>;
  refetchWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchWorkspaces = async () => {
    if (!user) {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/workspaces', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.workspaces)) {
        setWorkspaces(data.workspaces);
        
        // Restore last selected workspace from localStorage if still authorized
        const savedId = localStorage.getItem('aicas_active_workspace_id');
        const restored = data.workspaces.find((w: Workspace) => w.id === savedId);
        
        if (restored) {
          setActiveWorkspace(restored);
        } else {
          setActiveWorkspace(data.workspaces[0] || null);
          if (data.workspaces[0]) {
            localStorage.setItem('aicas_active_workspace_id', data.workspaces[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch authorized workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [user]);

  const switchWorkspace = async (workspaceId: string): Promise<boolean> => {
    const target = workspaces.find((w) => w.id === workspaceId);
    if (!target) return false;

    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActiveWorkspace(target);
        localStorage.setItem('aicas_active_workspace_id', target.id);
        // Dispatch custom workspace change event so components refetch workspace-dependent data
        window.dispatchEvent(new CustomEvent('workspace-changed', { detail: { workspaceId: target.id } }));
        return true;
      } else {
        alert(data.error || 'Failed to switch workspace context');
        return false;
      }
    } catch {
      alert('Network error switching workspace context');
      return false;
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        loading,
        switchWorkspace,
        refetchWorkspaces: fetchWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

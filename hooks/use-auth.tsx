'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { UserRole } from '@/lib/types';

export interface AuthUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  role: UserRole;
  walletBalance: number;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  refreshUser: () => Promise<void>;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  signup: (name: string, identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  isSuperAdmin: false,
  refreshUser: async () => {},
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Synchronize user from server-side session cookie on mount
  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me', { method: 'GET', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone,
            avatar: data.user.avatar,
            role: data.user.role || 'user',
            walletBalance: typeof data.user.walletBalance === 'number' ? data.user.walletBalance : 0,
          });
          return;
        }
      }
      setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (identifier: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier, password: pass }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Login failed. Please check credentials.' };
      }

      setUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        avatar: data.user.avatar,
        role: data.user.role || 'user',
        walletBalance: data.user.walletBalance || 0,
      });

      return { success: true, role: data.user.role };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error during login' };
    }
  };

  const signup = async (name: string, identifier: string, pass: string) => {
    try {
      const clean = identifier.trim();
      const isEmail = clean.includes('@');
      const payload = {
        name: name.trim(),
        email: isEmail ? clean.toLowerCase() : `${clean.replace(/\D/g, '')}@sonicuser.local`,
        phone: isEmail ? '01733185830' : clean,
        password: pass,
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      setUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        avatar: data.user.avatar,
        role: data.user.role || 'user',
        walletBalance: data.user.walletBalance || 100,
      });

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error during registration' };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      const email = (googleUser.email || '').toLowerCase().trim();
      const authUserPayload = {
        id: googleUser.uid,
        name: googleUser.displayName || email.split('@')[0] || 'Gamer',
        email,
        avatar: googleUser.photoURL || undefined,
      };

      const res = await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(authUserPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to authenticate Google account' };
      }

      const syncedUser: AuthUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        avatar: data.user.avatar,
        role: data.user.role || 'user',
        walletBalance: typeof data.user.walletBalance === 'number' ? data.user.walletBalance : 0,
      };

      setUser(syncedUser);
      return { success: true, role: syncedUser.role };
    } catch (err: any) {
      console.error('[Google Auth Error]:', err);
      let message = 'Google sign-in failed. Please try again.';
      if (err.code === 'auth/popup-closed-by-user') {
        message = 'Google sign-in popup was closed.';
      } else if (err.code === 'auth/popup-blocked') {
        message = 'Browser blocked popup. Please allow popups for this site.';
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      await fbSignOut(auth).catch(() => {});
    } catch (e) {
      console.warn('Logout network error:', e);
    } finally {
      setUser(null);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin,
        isSuperAdmin,
        refreshUser,
        login,
        signup,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

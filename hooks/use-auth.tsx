'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';

export interface AuthUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  role: 'user' | 'admin';
  walletBalance: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string; role?: 'user' | 'admin' }>;
  signup: (name: string, identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string; role?: 'user' | 'admin' }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  logout: () => {},
});

const ADMIN_IDENTIFIERS = [
  'admin',
  'admin@sonic.com',
  'admin@sonicseshop.com',
  '01733185830',
  'saikatahmmad77@gmail.com',
  'saikat01733@gmail.com',
  'md.asifiqbal2008@gmail.com',
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sonic_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        // Background sync to ensure role changes made by admin in DB are reflected
        fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed),
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.user) {
              const updated: AuthUser = {
                ...parsed,
                role: data.user.role || parsed.role,
                walletBalance: typeof data.user.walletBalance === 'number' ? data.user.walletBalance : parsed.walletBalance,
                name: data.user.name || parsed.name,
              };
              saveUserSession(updated);
            }
          })
          .catch(() => {});
      }
    } catch (e) {
      console.error('Failed to parse auth user', e);
    }

    // Listen to Firebase Auth state for automatic Google user session restoration & MongoDB sync
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const email = fbUser.email || '';
        const isAdmin = isRoleAdmin(email);
        const assignedRole: 'user' | 'admin' = isAdmin ? 'admin' : 'user';

        const authUser: AuthUser = {
          id: fbUser.uid,
          name: fbUser.displayName || email.split('@')[0] || 'Google Gamer',
          email,
          avatar: fbUser.photoURL || undefined,
          role: assignedRole,
          walletBalance: isAdmin ? 25000 : 500,
        };

        try {
          const res = await fetch('/api/auth/sync-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(authUser),
          });
          const data = await res.json();
          if (data.success && data.user) {
            saveUserSession({
              ...authUser,
              role: data.user.role || authUser.role,
              walletBalance: typeof data.user.walletBalance === 'number' ? data.user.walletBalance : authUser.walletBalance,
              name: data.user.name || authUser.name,
            });
          } else {
            saveUserSession(authUser);
          }
        } catch {
          saveUserSession(authUser);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const saveUserSession = (newUser: AuthUser | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('sonic_auth_user', JSON.stringify(newUser));
      if (newUser.role === 'admin') {
        localStorage.setItem('sonic_admin_token', 'sonic_admin_session_token_' + Date.now());
      } else {
        localStorage.removeItem('sonic_admin_token');
      }
    } else {
      localStorage.removeItem('sonic_auth_user');
      localStorage.removeItem('sonic_admin_token');
    }
  };

  const isRoleAdmin = (identifier: string, pass?: string): boolean => {
    const clean = identifier.trim().toLowerCase();
    if (ADMIN_IDENTIFIERS.includes(clean)) return true;
    if (pass === 'sonic2026') return true;
    return false;
  };

  const login = async (identifier: string, pass: string) => {
    const clean = identifier.trim().toLowerCase();
    if (!clean) {
      return { success: false, error: 'Please enter your email or phone number' };
    }

    const isAdmin = isRoleAdmin(clean, pass);
    let authUser: AuthUser = {
      id: isAdmin ? 'usr-admin-1' : 'usr-' + Math.floor(1000 + Math.random() * 9000),
      name: isAdmin ? 'Sonic Admin' : (clean.includes('@') ? clean.split('@')[0] : 'Gamer User'),
      email: clean.includes('@') ? clean : undefined,
      phone: clean.includes('@') ? '01733185830' : clean,
      role: isAdmin ? 'admin' : 'user',
      walletBalance: isAdmin ? 25000 : 1250,
    };

    try {
      const res = await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authUser),
      });
      const data = await res.json();
      if (data.success && data.user) {
        authUser = {
          ...authUser,
          role: data.user.role || authUser.role,
          walletBalance: typeof data.user.walletBalance === 'number' ? data.user.walletBalance : authUser.walletBalance,
          name: data.user.name || authUser.name,
        };
      }
    } catch (e) {
      console.warn('[Auth] syncUser error:', e);
    }

    saveUserSession(authUser);
    return { success: true, role: authUser.role };
  };

  const signup = async (name: string, identifier: string, pass: string) => {
    const clean = identifier.trim().toLowerCase();
    if (!clean) {
      return { success: false, error: 'Please provide valid credentials' };
    }

    const isAdmin = isRoleAdmin(clean, pass);
    let authUser: AuthUser = {
      id: 'usr-' + Math.floor(1000 + Math.random() * 9000),
      name: name.trim() || 'Gamer User',
      email: clean.includes('@') ? clean : undefined,
      phone: clean.includes('@') ? undefined : clean,
      role: isAdmin ? 'admin' : 'user',
      walletBalance: 100, // ৳100 Welcome Bonus
    };

    try {
      const res = await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authUser),
      });
      const data = await res.json();
      if (data.success && data.user) {
        authUser = {
          ...authUser,
          role: data.user.role || authUser.role,
          walletBalance: typeof data.user.walletBalance === 'number' ? data.user.walletBalance : authUser.walletBalance,
          name: data.user.name || authUser.name,
        };
      }
    } catch (e) {
      console.warn('[Auth] syncUser signup error:', e);
    }

    saveUserSession(authUser);
    return { success: true };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string; role?: 'user' | 'admin' }> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      const email = googleUser.email || '';
      const isAdmin = isRoleAdmin(email);
      const assignedRole: 'user' | 'admin' = isAdmin ? 'admin' : 'user';

      let authUser: AuthUser = {
        id: googleUser.uid || 'usr-' + Date.now(),
        name: googleUser.displayName || email.split('@')[0] || 'Google Gamer',
        email,
        avatar: googleUser.photoURL || undefined,
        role: assignedRole,
        walletBalance: isAdmin ? 25000 : 500,
      };

      try {
        const res = await fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(authUser),
        });
        const data = await res.json();
        if (data.success && data.user) {
          authUser = {
            ...authUser,
            role: data.user.role || authUser.role,
            walletBalance: typeof data.user.walletBalance === 'number' ? data.user.walletBalance : authUser.walletBalance,
            name: data.user.name || authUser.name,
          };
        }
      } catch (e) {
        console.warn('[Auth] syncUser Google error:', e);
      }

      saveUserSession(authUser);
      return { success: true, role: authUser.role };
    } catch (err: any) {
      console.error('[Google Auth Error]:', err);
      let message = 'Google sign-in failed. Please try again.';
      if (err.code === 'auth/popup-closed-by-user') {
        message = 'Google sign-in popup was closed.';
      } else if (err.code === 'auth/popup-blocked') {
        message = 'Browser blocked the Google popup. Please allow popups for this site.';
      } else if (err.code === 'auth/unauthorized-domain') {
        message = 'This domain is not authorized in Firebase Console (Authentication > Settings > Authorized domains).';
      } else if (err.code === 'auth/operation-not-allowed') {
        message = 'Google provider is not enabled in Firebase Console (Authentication > Sign-in method).';
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, error: message };
    }
  };

  const logout = () => {
    saveUserSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
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

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'user' | 'admin';
  walletBalance: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (phoneOrEmail: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, phone: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  quickLoginAs: (role: 'user' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: () => {},
  quickLoginAs: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sonic_auth_user');
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse auth user', e);
    }
  }, []);

  const saveUserSession = (newUser: AuthUser | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('sonic_auth_user', JSON.stringify(newUser));
      if (newUser.role === 'admin') {
        localStorage.setItem('sonic_admin_token', 'sonic_admin_session_token_' + Date.now());
      }
    } else {
      localStorage.removeItem('sonic_auth_user');
      localStorage.removeItem('sonic_admin_token');
    }
  };

  const login = async (phoneOrEmail: string, pass: string) => {
    const cleanInput = phoneOrEmail.trim().toLowerCase();
    
    // Check if logging in as Admin
    if (cleanInput === 'admin' || cleanInput === 'admin@sonic.com' || cleanInput === '01733185830' || pass === 'sonic2026') {
      const adminUser: AuthUser = {
        id: 'usr-admin-1',
        name: 'Sonic Admin',
        phone: '01733185830',
        email: 'admin@sonicseshop.com',
        role: 'admin',
        walletBalance: 25000,
      };
      saveUserSession(adminUser);
      return { success: true };
    }

    // Customer login
    const customerUser: AuthUser = {
      id: 'usr-' + Math.floor(1000 + Math.random() * 9000),
      name: cleanInput.includes('@') ? cleanInput.split('@')[0] : 'Gamer User',
      phone: cleanInput.replace(/\D/g, '') || '01712345678',
      email: cleanInput.includes('@') ? cleanInput : undefined,
      role: 'user',
      walletBalance: 1250,
    };
    saveUserSession(customerUser);
    return { success: true };
  };

  const signup = async (name: string, phone: string, pass: string) => {
    const newUser: AuthUser = {
      id: 'usr-' + Math.floor(1000 + Math.random() * 9000),
      name: name.trim() || 'New Gamer',
      phone: phone.trim(),
      role: 'user',
      walletBalance: 100, // ৳100 Welcome signup bonus
    };
    saveUserSession(newUser);
    return { success: true };
  };

  const logout = () => {
    saveUserSession(null);
  };

  const quickLoginAs = (role: 'user' | 'admin') => {
    if (role === 'admin') {
      saveUserSession({
        id: 'usr-admin-1',
        name: 'Asif Iqbal (Admin)',
        phone: '01733185830',
        email: 'admin@sonicseshop.com',
        role: 'admin',
        walletBalance: 50000,
      });
    } else {
      saveUserSession({
        id: 'usr-gamer-88',
        name: 'Saikat (Pro Gamer)',
        phone: '01812345678',
        role: 'user',
        walletBalance: 3450,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        login,
        signup,
        logout,
        quickLoginAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

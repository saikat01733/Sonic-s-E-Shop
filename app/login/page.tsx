'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { ShieldCheck, User, ArrowLeft, Lock, Phone, Zap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, quickLoginAs } = useAuth();
  const { t } = useLanguage();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your phone number or email');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await login(identifier, password);
      if (res.success) {
        router.push('/');
      } else {
        setError(res.error || 'Login failed. Please check credentials.');
      }
    } catch {
      setError('Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: 'user' | 'admin') => {
    quickLoginAs(role);
    router.push(role === 'admin' ? '/admin' : '/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card variant="glass" className="w-full max-w-md p-6 sm:p-8 space-y-6 border-white/20 shadow-2xl backdrop-blur-3xl">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto text-white shadow-lg shadow-cyan-500/30 text-xl font-black mb-3">
            ⚡
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            Sign In to Sonic's E-Shop
          </h1>
          <p className="text-xs text-gray-300">
            Access your gamer orders, wallet balance, and instant top-ups
          </p>
        </div>

        {/* 1-Click Quick Demo Login Row */}
        <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-cyan-500/30 space-y-2">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-300 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>1-Click Test Accounts (Demo Access):</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Login as Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('user')}
              className="py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login as Gamer</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Phone Number or Email"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            placeholder="e.g. 01712345678 or gamer@email.com"
            icon={<Phone className="w-3.5 h-3.5" />}
            required
            autoFocus
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            icon={<Lock className="w-3.5 h-3.5" />}
            required
          />

          {error && (
            <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/35 text-xs text-red-300 font-semibold text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={loading}
          >
            Sign In →
          </Button>
        </form>

        {/* Footer links */}
        <div className="flex items-center justify-between text-xs text-gray-300 border-t border-white/10 pt-4">
          <Link href="/signup" className="hover:text-white transition-colors">
            Don't have an account? <strong className="text-cyan-300 underline">Sign Up</strong>
          </Link>
          <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
        </div>
      </Card>
    </div>
  );
}

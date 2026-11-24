'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck, Gift, ArrowLeft, Zap } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signup, loginWithGoogle } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !identifier.trim() || !password.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await signup(name, identifier, password);
      if (res.success) {
        router.push('/');
      } else {
        setError(res.error || 'Registration failed');
      }
    } catch {
      setError('Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        router.push(res.role === 'admin' ? '/admin' : '/');
      }
    } catch (err: any) {
      setError(err.message || 'Google registration failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6 relative">
      {/* Back to Home Button */}
      <Link
        href="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white text-xs font-bold transition-all z-20 backdrop-blur-xl shadow-lg"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
        <span>Back to Store</span>
      </Link>

      {/* Two-Column Split Liquid Glass Card (Matching Image 2 Reference) */}
      <div className="w-full max-w-4xl rounded-3xl liquid-glass border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden grid grid-cols-1 md:grid-cols-12 backdrop-blur-3xl animate-fadeIn">
        
        {/* LEFT COLUMN: Clean Create Account Form */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-5">
          <div>
            {/* Header Brand */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-cyan-500/30">
                ⚡
              </div>
              <span className="font-extrabold text-sm tracking-tight text-white">Sonic's E-Shop</span>
            </div>

            <div className="space-y-1 mb-4">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Create account
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                Get started with instant checkout & ৳100 welcome bonus credit
              </p>
            </div>

            {/* ৳100 Welcome Bonus Pill */}
            <div className="p-2.5 mb-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
              <Gift className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="font-semibold">৳100 Instant Bonus will be credited to your Gamer Wallet!</span>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 font-semibold">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Your Full Name</label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Asif Iqbal"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.06] border border-white/15 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.1] transition-all"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Email or Mobile Phone</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="name@email.com or 017XXXXXXXX"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.06] border border-white/15 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.1] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Password</label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white/[0.06] border border-white/15 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.1] transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-gray-400 hover:text-white transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full mt-2 font-black tracking-wide"
              >
                Create account
              </Button>
            </form>

            {/* Switch to Login Link */}
            <div className="text-center mt-3">
              <span className="text-xs text-gray-400">
                Already have an account?{' '}
                <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-extrabold transition-colors">
                  Login
                </Link>
              </span>
            </div>
          </div>

          {/* Social Logins Divider & Buttons (Matching Image 2) */}
          <div className="pt-2">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-3 text-[11px] text-gray-400 font-medium">Or continue with</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <div className="mt-2">
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-2xl bg-white/[0.07] hover:bg-white/[0.14] border border-white/15 text-white [html.light-theme_&]:text-slate-900 [html.light-theme_&]:bg-black/[0.04] [html.light-theme_&]:border-black/10 text-xs font-bold transition-all shadow-md hover:scale-102 active:scale-98 cursor-pointer"
                title="Sign up with Google"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Atmospheric Visual Showcase (Matching Image 2 Reference) */}
        <div className="hidden md:flex md:col-span-5 relative bg-gradient-to-br from-[#0c203b]/90 via-[#071529]/95 to-[#020713] p-8 flex-col justify-between overflow-hidden border-l border-white/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full filter blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full filter blur-3xl pointer-events-none" />

          {/* Top Badge */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-black">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gamer Membership Perks</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white leading-tight">
                Join 100,000+ Gamers in Bangladesh
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Enjoy zero-wait UID top-ups, cashback rewards, and priority support queue.
              </p>
            </div>
          </div>

          {/* Center Showcase Artwork */}
          <div className="relative z-10 space-y-3 my-4">
            <div className="p-4 rounded-2xl liquid-glass-sm bg-white/[0.05] border border-white/15 space-y-2 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-emerald-400" />
                  <span>Signup Bonus</span>
                </span>
                <span className="text-xs font-black text-emerald-300 font-mono">৳100 Free</span>
              </div>
              <p className="text-[11px] text-gray-300">
                Immediately usable on your first eFootball, PUBG UC, or Roblox order!
              </p>
            </div>

            <div className="p-3 rounded-2xl liquid-glass-sm bg-white/[0.05] border border-white/15 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-2.5">
                <img src="/assets/roblox.jpg" alt="Roblox" className="w-9 h-9 rounded-xl object-cover" />
                <div>
                  <div className="text-xs font-bold text-white">Roblox Robux VIP</div>
                  <div className="text-[10px] text-emerald-400 font-medium">⚡ 5-15 Mins Delivery</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full">
                100% Safe
              </span>
            </div>
          </div>

          {/* Bottom Trust Guarantee */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-300">
            <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Official Konami & Tencent Partner</span>
            </span>
            <span className="text-gray-400">100% Safe</span>
          </div>
        </div>
      </div>
    </div>
  );
}

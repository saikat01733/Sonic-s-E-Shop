'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Zap, ArrowLeft, Gamepad2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const { t } = useLanguage();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your email or phone number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await login(identifier, password);
      if (res.success) {
        router.push(res.role === 'admin' ? '/admin' : '/');
      } else {
        setError(res.error || 'Login failed. Please check credentials.');
      }
    } catch {
      setError('Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        router.push(res.role === 'admin' ? '/admin' : '/');
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
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

      {/* Two-Column Split Liquid Glass Card */}
      <div className="w-full max-w-4xl rounded-3xl liquid-glass border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden grid grid-cols-1 md:grid-cols-12 backdrop-blur-3xl animate-fadeIn">
        
        {/* LEFT COLUMN: Clean Form */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <div>
            {/* Header Brand */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-cyan-500/30">
                ⚡
              </div>
              <span className="font-extrabold text-sm tracking-tight text-white">Sonic's E-Shop</span>
            </div>

            <div className="space-y-1 mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome back
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                Sign in to manage your gamer orders and instant top-ups
              </p>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 font-semibold">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Email or Phone Number</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="name@email.com or 017XXXXXXXX"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.06] border border-white/15 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:bg-white/[0.1] transition-all"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300">Password</label>
                  <Link href="/account" className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
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
                Sign In
              </Button>
            </form>

            {/* Switch to Signup Link */}
            <div className="text-center mt-4">
              <span className="text-xs text-gray-400">
                Don't have an account?{' '}
                <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-extrabold transition-colors">
                  Create account
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

            <div className="flex items-center justify-center gap-3 mt-3">
              {/* Google Button with Official G Logo */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="flex items-center justify-center gap-2 flex-1 py-2.5 px-4 rounded-2xl bg-white/[0.07] hover:bg-white/[0.14] border border-white/15 text-white text-xs font-bold transition-all shadow-md hover:scale-102 active:scale-98 cursor-pointer"
                title="Sign in with Google"
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
                <span>Google</span>
              </button>

              {/* Apple Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 flex-1 py-2.5 px-4 rounded-2xl bg-white/[0.07] hover:bg-white/[0.14] border border-white/15 text-white text-xs font-bold transition-all shadow-md hover:scale-102 active:scale-98 cursor-pointer"
                title="Sign in with Apple"
              >
                <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.85-11.97-14.43-5.74-8.82-10.22-18.7-13.43-29.65-3.21-10.95-4.82-21.57-4.82-31.85 0-14.48 3.59-26.68 10.77-36.6 7.18-9.92 16.34-15.01 27.48-15.26 4.9.13 10.37 1.39 16.42 3.79 6.05 2.4 10.33 3.66 12.83 3.79 2.12-.13 6.64-1.47 13.56-4.02 6.92-2.55 12.65-3.72 17.2-3.51 13.06.66 23.46 5.37 31.2 14.13-11.45 6.97-17.06 16.5-16.83 28.58.23 9.49 3.86 17.5 10.89 24.03 7.03 6.53 15.34 10.27 24.94 11.22-1.92 5.89-4.35 12.01-7.29 18.36zM119.22 33.11c0-7.2 2.66-14.07 7.98-20.61 5.32-6.54 11.95-10.7 19.89-12.5 1.13 6.93-.05 13.68-3.54 20.25-3.49 6.57-8.63 11.22-15.42 13.95-1.74-.23-4.71-.58-8.91-1.09z" />
                </svg>
                <span>Apple</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Atmospheric Visual Showcase (Matching Image 2 Layout) */}
        <div className="hidden md:flex md:col-span-5 relative bg-gradient-to-br from-[#0c203b]/90 via-[#071529]/95 to-[#020713] p-8 flex-col justify-between overflow-hidden border-l border-white/10">
          {/* Ambient Lighting Accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full filter blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full filter blur-3xl pointer-events-none" />

          {/* Top Visual Badges */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-black">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Official Gaming Top-Up</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white leading-tight">
                Level Up Your Gaming Experience
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Instant Player ID delivery with 100% account protection via bKash & Nagad.
              </p>
            </div>
          </div>

          {/* Center Floating Glass Game Cards Preview */}
          <div className="relative z-10 space-y-2.5 my-4">
            <div className="p-3 rounded-2xl liquid-glass-sm bg-white/[0.05] border border-white/15 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-2.5">
                <img src="/assets/pubg.jpg" alt="PUBG" className="w-9 h-9 rounded-xl object-cover" />
                <div>
                  <div className="text-xs font-bold text-white">PUBG Mobile UC</div>
                  <div className="text-[10px] text-emerald-400 font-medium">⚡ 1-5 Mins Delivery</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full">
                Instant UID
              </span>
            </div>

            <div className="p-3 rounded-2xl liquid-glass-sm bg-white/[0.05] border border-white/15 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-2.5">
                <img src="/assets/efootball.jpg" alt="eFootball" className="w-9 h-9 rounded-xl object-cover" />
                <div>
                  <div className="text-xs font-bold text-white">eFootball™ Coins</div>
                  <div className="text-[10px] text-emerald-400 font-medium">⚡ 1-10 Mins Delivery</div>
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
              <span>SSL 256-Bit Encrypted</span>
            </span>
            <span className="text-gray-400">Bangladesh #1</span>
          </div>
        </div>
      </div>
    </div>
  );
}

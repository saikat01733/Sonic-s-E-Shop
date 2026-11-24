'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { ArrowLeft, User, Phone, Lock, Gift } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !password.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    if (phone.trim().length < 6) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await signup(name, phone, password);
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card variant="glass" className="w-full max-w-md p-6 sm:p-8 space-y-6 border-white/20 shadow-2xl backdrop-blur-3xl">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto text-white shadow-lg shadow-cyan-500/30 text-xl font-black mb-3">
            ⚡
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            Create Gamer Account
          </h1>
          <p className="text-xs text-gray-300">
            Sign up to receive ৳100 welcome bonus wallet credits!
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <Gift className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Instant 1-click checkout & bonus reward on registration!</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Your Name *"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Asif Iqbal"
            icon={<User className="w-3.5 h-3.5" />}
            required
            autoFocus
          />

          <Input
            label="Mobile Phone Number *"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="e.g. 01733185830"
            icon={<Phone className="w-3.5 h-3.5" />}
            required
          />

          <Input
            label="Create Password *"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
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
            Create Account & Get Bonus →
          </Button>
        </form>

        <div className="flex items-center justify-between text-xs text-gray-300 border-t border-white/10 pt-4">
          <Link href="/login" className="hover:text-white transition-colors">
            Already have an account? <strong className="text-cyan-300 underline">Sign In</strong>
          </Link>
          <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
        </div>
      </Card>
    </div>
  );
}

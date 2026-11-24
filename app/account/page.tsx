'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import AccountSection from '@/components/storefront/AccountSection';
import { SiteSettings, GameItem } from '@/lib/types';
import { User, ShieldCheck, RefreshCw } from 'lucide-react';

export default function AccountPage() {
  const [games, setGames] = useState<GameItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/site-data')
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setGames(json.data.games);
          setSettings(json.data.settings);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar settings={settings || undefined} games={games} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 mt-8 w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-xs">
            <User className="w-3.5 h-3.5" />
            <span>কাস্টমার প্রোফাইল ও নিরাপত্তা</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Sonic’s Gamer Hub Account
          </h1>
          <p className="text-xs text-gray-400">
            দড়ি টেনে বাতি জ্বালিয়ে আপনার একাউন্টে প্রবেশ করুন
          </p>
        </div>

        {/* Retro Pull-String Hanging Lamp & Login Form */}
        <AccountSection />
      </main>

      <Footer settings={settings || undefined} />
    </div>
  );
}

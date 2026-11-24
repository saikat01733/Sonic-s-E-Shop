'use client';

import React from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { PullStringLamp } from '@/components/features/account/pull-string-lamp';
import { useSiteData } from '@/hooks/use-site-data';
import { User } from 'lucide-react';

export default function AccountPage() {
  const { games, settings } = useSiteData();

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar settings={settings} games={games} />

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

        <PullStringLamp />
      </main>

      <Footer settings={settings} />
    </div>
  );
}

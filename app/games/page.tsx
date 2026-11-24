'use client';

import React, { useState } from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { GameCard } from '@/components/features/games/game-card';
import { Card } from '@/components/ui/card';
import { useSiteData } from '@/hooks/use-site-data';
import { Search, Gamepad2, RefreshCw } from 'lucide-react';

export default function AllGamesPage() {
  const { games, settings, loading } = useSiteData();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'সব গেম (All Games)' },
    { id: 'efootball', name: 'eFootball™' },
    { id: 'pubg', name: 'PUBG Mobile' },
    { id: 'roblox', name: 'Roblox' }
  ];

  const filteredGames = games.filter(g => {
    const matchCat = category === 'all' || g.category === category || g.id === category;
    const matchSearch =
      !search ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.name_bn && g.name_bn.toLowerCase().includes(search.toLowerCase())) ||
      g.category_name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar settings={settings} games={games} />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 mt-8 w-full">
        {/* Page Header */}
        <Card variant="glass" className="p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-xs mb-3">
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>গেমিং ডিরেক্টরি</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              সকল গেমিং টপ-আপ ক্যাটালগ
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
              আপনার পছন্দের গেম নির্বাচন করুন এবং সরাসরি ইন-গেম ইউআইডি বা লগইন মেথডে ১ থেকে ১০ মিনিটে দ্রুত ও ১০০% নিরাপদ টপ-আপ নিন।
            </p>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    category === cat.id
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                      : 'bg-white/8 text-gray-300 hover:text-white hover:bg-white/15'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="গেম খুঁজুন (যেমন: PUBG, eFootball)..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/8 border border-white/10 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-red-500/50"
              />
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="py-20 text-center text-white text-xs flex flex-col items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-red-500 mb-2" />
            <span>গেমসমূহ লোড হচ্ছে...</span>
          </div>
        ) : filteredGames.length === 0 ? (
          <Card variant="glass" className="p-12 text-center text-gray-400 text-sm">
            কোনো গেম পাওয়া যায়নি!
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredGames.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
}

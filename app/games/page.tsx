'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import BottomDock from '@/components/storefront/BottomDock';
import { GameItem, SiteSettings } from '@/lib/types';
import { Search, Zap, ShieldCheck, Gamepad2, ArrowRight, RefreshCw, Flame, Layers } from 'lucide-react';

export default function AllGamesPage() {
  const [games, setGames] = useState<GameItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetch('/api/site-data')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setGames(json.data.games);
          setSettings(json.data.settings);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
      <Navbar settings={settings || undefined} games={games} />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 mt-8 w-full">
        {/* Page Header */}
        <div className="liquid-glass p-6 sm:p-8 mb-8 relative overflow-hidden">
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
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    category === cat.id
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                      : 'bg-white/8 text-gray-300 hover:text-white hover:bg-white/15'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Live Search Input */}
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
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center text-white text-xs flex flex-col items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-red-500 mb-2" />
            <span>গেমসমূহ লোড হচ্ছে...</span>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="liquid-glass p-12 text-center text-gray-400 text-sm">
            কোনো গেম পাওয়া যায়নি!
          </div>
        ) : (
          /* Games Grid with Liquid Glass cards linking to /games/[slug] */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredGames.map(game => (
              <Link
                key={game.id}
                href={`/games/${game.slug}`}
                className="liquid-glass liquid-glass-hover overflow-hidden group flex flex-col justify-between transition-all"
              >
                {/* 16:9 Artwork Container */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/60">
                  <img
                    src={game.poster}
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    onError={(e: any) => (e.target.src = '/banner.jpg')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1018] via-black/20 to-transparent" />

                  {/* Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-lg"
                      style={{ backgroundColor: game.badge_color }}
                    >
                      {game.badge}
                    </span>
                  </div>

                  {/* Delivery Speed Badge */}
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-amber-300 font-bold text-[10px] flex items-center gap-1 border border-white/15">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>{game.delivery_time}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                      {game.category_name}
                    </span>
                    <h3 className="text-base font-black text-white group-hover:text-red-400 transition-colors mt-0.5">
                      {game.name}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                      {game.description}
                    </p>
                  </div>

                  {/* Meta Specs */}
                  <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-white/10 pt-2.5">
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" /> ১০০% নিরাপদ
                    </span>
                    <span>{game.packages.length} টি প্যাকেজ</span>
                  </div>

                  {/* Action CTA */}
                  <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 group-hover:from-red-500 group-hover:to-rose-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-600/25 transition-all">
                    <span>টপ-আপ করুন</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer settings={settings || undefined} />
      <BottomDock activeTab="home" onSelectTab={() => {}} />
    </div>
  );
}

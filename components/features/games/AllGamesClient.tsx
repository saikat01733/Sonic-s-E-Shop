'use client';

import React, { useState } from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { GameCard } from '@/components/features/games/game-card';
import { Card } from '@/components/ui/card';
import { useSiteData } from '@/hooks/use-site-data';
import { useLanguage } from '@/hooks/use-language';
import { GameItem, SiteSettings } from '@/lib/types';
import { Search, Gamepad2 } from 'lucide-react';

interface AllGamesClientProps {
  initialData?: {
    games: GameItem[];
    settings: SiteSettings;
  };
}

export default function AllGamesClient({ initialData }: AllGamesClientProps) {
  const { games, settings } = useSiteData(initialData);
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const categories = [
    { id: 'all', name: t('allCategories') },
    { id: 'efootball', name: 'eFootball™' },
    { id: 'pubg', name: 'PUBG Mobile' },
    { id: 'roblox', name: 'Roblox' },
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
        <Card variant="glass" className="p-6 sm:p-8 mb-8 relative overflow-hidden border-white/20">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/20 border border-rose-500/35 text-rose-400 font-bold text-xs mb-3 backdrop-blur-md">
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>{t('navGames')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              {t('allCategories')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
              Select your favorite game, choose the desired package, and top-up securely within 1-10 minutes.
            </p>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="mt-6 pt-5 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer backdrop-blur-xl ${
                    category === cat.id
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/40'
                      : 'bg-white/[0.06] border border-white/15 text-gray-300 hover:bg-white/[0.12] hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-9 pr-3.5 py-2 rounded-2xl bg-white/[0.08] border border-white/20 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-rose-500/70 backdrop-blur-xl"
              />
            </div>
          </div>
        </Card>

        {filteredGames.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm">
            {t('noResults')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
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

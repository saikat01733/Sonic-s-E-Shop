'use client';

import React, { useState } from 'react';
import { GameItem } from '@/lib/types';
import { Zap, ShieldCheck, ArrowRight, Layers } from 'lucide-react';

interface GameCatalogProps {
  games: GameItem[];
  selectedGameId: string;
  onSelectGame: (id: string) => void;
}

export default function GameCatalog({ games, selectedGameId, onSelectGame }: GameCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'সব গেম (All)' },
    { id: 'efootball', name: 'eFootball™' },
    { id: 'pubg', name: 'PUBG Mobile' },
    { id: 'roblox', name: 'Roblox' }
  ];

  const filteredGames = selectedCategory === 'all'
    ? games
    : games.filter(g => g.category === selectedCategory || g.id === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto px-4 mt-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            🎮 গেমিং টপ-আপ ক্যাটালগ (Select Game)
          </h2>
          <p className="text-xs text-gray-400">আপনার পছন্দের গেম নির্বাচন করে টপ-আপ শুরু করুন</p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Magnetic Tilt Game Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredGames.map(game => {
          const isSelected = game.id === selectedGameId;

          return (
            <div
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border ${
                isSelected
                  ? 'border-red-500 shadow-xl shadow-red-500/20 ring-2 ring-red-500/30'
                  : 'border-white/10 hover:border-white/25 glass-panel'
              }`}
            >
              {/* 16:9 Widescreen Poster */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/50">
                <img
                  src={game.poster}
                  alt={game.name}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  onError={(e: any) => (e.target.src = '/banner.jpg')}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Badge Top Left */}
                <div className="absolute top-2.5 left-2.5">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md"
                    style={{ backgroundColor: game.badge_color }}
                  >
                    {game.badge}
                  </span>
                </div>

                {/* Speed Badge Top Right */}
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-amber-300 font-bold text-[10px] flex items-center gap-1 border border-white/10">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>{game.delivery_time}</span>
                </div>

                {/* Glassmorphic Hover Details Overlay */}
                <div className="absolute inset-0 bg-black/85 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 z-10">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: game.badge_color }}
                    >
                      {game.badge}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> ১০০% নিরাপদ
                    </span>
                  </div>

                  <div className="space-y-1.5 py-1 text-[11px] text-gray-300">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>
                        <strong>ডেলিভারি:</strong> {game.delivery_time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span>
                        <strong>পদ্ধতি:</strong>{' '}
                        {game.product_type === 'login_purchase'
                          ? 'Konami ID লগইন'
                          : game.id === 'roblox'
                          ? 'রোব্লক্স ইউজারনেম'
                          : 'সরাসরি Player UID'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span>
                        <strong>প্যাকেজ:</strong> {game.packages.length} টি ভ্যারিয়েন্ট
                      </span>
                    </div>
                  </div>

                  <div className="w-full py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md">
                    <span>টপ-আপ করতে ক্লিক করুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Card Footer Info */}
              <div className="p-3 bg-[#0c1018]/90 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                    {game.category_name}
                  </span>
                  <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                    {game.name}
                  </h3>
                </div>

                <button
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-white/10 text-gray-300 group-hover:bg-red-500 group-hover:text-white'
                  }`}
                >
                  {isSelected ? 'নির্বাচিত ✓' : 'টপ-আপ'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

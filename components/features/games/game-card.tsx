'use client';

import React from 'react';
import Link from 'next/link';
import { GameItem } from '@/lib/types';
import { Zap, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

interface GameCardProps {
  game: GameItem;
}

export function GameCard({ game }: GameCardProps) {
  const { locale, t } = useLanguage();

  const imageUrl = game.poster || (game as any).image || '/assets/efootball.jpg';
  const categoryTag = game.category_name || (game as any).publisher || game.category || 'Gaming Top-Up';
  const gameTitle = locale === 'bn' && game.name_bn ? game.name_bn : game.name;

  return (
    <Link
      href={`/games/${game.slug}`}
      className="group relative block w-full overflow-hidden rounded-3xl border border-white/15 [html.light-theme_&]:border-slate-300/80 bg-[#07090e] shadow-xl hover:border-rose-500/60 hover:shadow-2xl hover:shadow-rose-950/40 transition-all duration-500 cursor-pointer"
    >
      {/* Full-bleed Artwork Container */}
      <div className="relative aspect-[16/11] sm:aspect-[4/3] w-full overflow-hidden">
        {/* Background Full Image */}
        <img
          src={imageUrl}
          alt={game.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          onError={(e: any) => (e.target.src = '/banner.webp')}
        />

        {/* Ambient Glass Darkening Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06080d] via-[#06080d]/40 to-transparent transition-opacity duration-500 group-hover:from-[#06080d]/95 group-hover:via-[#06080d]/60" />

        {/* Top Badges (Hot Deal & Delivery Time) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          {game.badge && (
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white shadow-md backdrop-blur-md"
              style={{
                backgroundColor: game.badge_color ? `${game.badge_color}99` : 'rgba(225, 29, 72, 0.85)',
                border: `1px solid ${game.badge_color || '#e11d48'}`,
              }}
            >
              {game.badge}
            </span>
          )}

          {game.delivery_time && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black text-cyan-300 bg-black/60 border border-cyan-500/30 backdrop-blur-md shadow-md">
              <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>{game.delivery_time}</span>
            </span>
          )}
        </div>

        {/* Hover / Bottom Details Container (Shows Category, Name, and Top-Up Button) */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-col justify-end z-10 transition-all duration-300">
          {/* 1. Category Tag (e.g. eFootball / PUBG Mobile / Roblox) */}
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-rose-400 [html.light-theme_&]:text-rose-500 drop-shadow-md mb-0.5 transition-transform duration-300">
            {categoryTag}
          </span>

          {/* 2. Game Title (e.g. eFootball™ Coins) */}
          <h3 className="text-base sm:text-lg font-black text-white [html.light-theme_&]:text-white group-hover:text-rose-300 transition-colors drop-shadow-lg leading-snug line-clamp-1 mb-3">
            {gameTitle}
          </h3>

          {/* 3. Top-Up Button */}
          <div className="w-full py-2.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 group-hover:bg-rose-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/60 border border-rose-500/50 group-hover:border-rose-400/80 group-hover:shadow-rose-600/30 transition-all duration-300">
            <span>{t('topUpBtn') || 'Top-Up'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}

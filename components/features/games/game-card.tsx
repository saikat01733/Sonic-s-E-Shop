'use client';

import React from 'react';
import Link from 'next/link';
import { GameItem } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

interface GameCardProps {
  game: GameItem;
}

export function GameCard({ game }: GameCardProps) {
  const { locale, t } = useLanguage();

  return (
    <Link
      href={`/games/${game.slug}`}
      className="block group transition-all duration-300 cursor-pointer"
    >
      <Card variant="glass" hoverable className="overflow-hidden flex flex-col justify-between h-full border-white/20">
        {/* 16:9 Widescreen Artwork Container */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/60">
          <img
            src={game.poster}
            alt={game.name}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
            onError={(e: any) => (e.target.src = '/banner.jpg')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06080d] via-black/30 to-transparent" />

          {/* Badge Top Left */}
          <div className="absolute top-3 left-3">
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white shadow-lg backdrop-blur-md"
              style={{ backgroundColor: `${game.badge_color}90`, border: `1px solid ${game.badge_color}` }}
            >
              {game.badge}
            </span>
          </div>

          {/* Speed Badge Top Right */}
          <div className="absolute top-3 right-3">
            <Badge variant="speed" icon={<Zap className="w-3 h-3 text-cyan-400" />}>
              {game.delivery_time}
            </Badge>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3">
          <div>
            <span className="text-[10px] font-bold text-gray-400 [html.light-theme_&]:text-slate-500 uppercase tracking-widest block">
              {game.category_name}
            </span>
            <h3 className="text-base font-black text-white [html.light-theme_&]:text-slate-900 group-hover:text-rose-400 [html.light-theme_&]:group-hover:text-rose-600 transition-colors mt-0.5">
              {locale === 'bn' && game.name_bn ? game.name_bn : game.name}
            </h3>
            <p className="text-xs text-gray-300 [html.light-theme_&]:text-slate-600 line-clamp-2 mt-1 leading-relaxed">
              {game.description}
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-300 [html.light-theme_&]:text-slate-600 border-t border-white/10 [html.light-theme_&]:border-black/10 pt-2.5">
            <span className="flex items-center gap-1 text-emerald-400 [html.light-theme_&]:text-emerald-700 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> {t('secureGuaranteed')}
            </span>
            <span>{game.packages.length} {t('packagesAvailable')}</span>
          </div>

          <div className="w-full py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/40 border border-rose-500/40 transition-all">
            <span>{t('topUpBtn')}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

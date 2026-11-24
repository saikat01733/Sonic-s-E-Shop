'use client';

import React from 'react';
import Link from 'next/link';
import { GameItem } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, ShieldCheck, ArrowRight, Layers } from 'lucide-react';

interface GameCardProps {
  game: GameItem;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className="block group transition-all duration-300"
    >
      <Card variant="glass" hoverable className="overflow-hidden flex flex-col justify-between h-full">
        {/* 16:9 Widescreen Artwork Container */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/60">
          <img
            src={game.poster}
            alt={game.name}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
            onError={(e: any) => (e.target.src = '/banner.jpg')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1018] via-black/25 to-transparent" />

          {/* Badge Top Left */}
          <div className="absolute top-3 left-3">
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white shadow-lg"
              style={{ backgroundColor: game.badge_color }}
            >
              {game.badge}
            </span>
          </div>

          {/* Speed Badge Top Right */}
          <div className="absolute top-3 right-3">
            <Badge variant="speed" icon={<Zap className="w-3 h-3 text-amber-400" />}>
              {game.delivery_time}
            </Badge>
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

          <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-white/10 pt-2.5">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> ১০০% নিরাপদ
            </span>
            <span>{game.packages.length} টি প্যাকেজ</span>
          </div>

          <div className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 group-hover:from-red-500 group-hover:to-rose-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-600/25 transition-all">
            <span>টপ-আপ করুন</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

'use client';

import React from 'react';
import { SiteSettings } from '@/lib/types';
import { Zap, ShieldCheck, Flame } from 'lucide-react';

interface HeroBannerProps {
  settings: SiteSettings;
}

export default function HeroBanner({ settings }: HeroBannerProps) {
  return (
    <div className="w-full space-y-4">
      {/* Dynamic Announcement Ticker */}
      <div className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white py-1.5 px-4 overflow-hidden shadow-md">
        <div className="max-w-6xl mx-auto flex items-center">
          <div className="flex items-center gap-1.5 font-bold text-xs bg-black/30 px-2 py-0.5 rounded-md mr-3 flex-shrink-0 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>নোটিশ:</span>
          </div>
          <div className="overflow-hidden relative w-full text-xs font-medium tracking-wide">
            <div className="animate-marquee">
              <span className="mr-12">{settings.tickerText}</span>
              <span className="mr-12">{settings.tickerText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Showcase Banner */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl group">
          <div className="relative aspect-[21/9] sm:aspect-[24/8] w-full overflow-hidden bg-black/40">
            <img
              src={settings.heroBanner || '/banner.webp'}
              alt={settings.heroTitle || "Sonic's E-Shop Banner"}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
              onError={(e: any) => (e.target.src = '/banner.jpg')}
            />
            {/* Ambient vignette and gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080a0f] via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#080a0f]/80 via-transparent to-[#080a0f]/80" />

            {/* Badges Overlay */}
            <div className="absolute top-3 left-3 sm:top-5 sm:left-5 flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white font-extrabold text-[11px] sm:text-xs flex items-center gap-1 shadow-lg">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>২৪/৭ ইনস্ট্যান্ট টপ-আপ</span>
              </div>
            </div>

            <div className="absolute top-3 right-3 sm:top-5 sm:right-5">
              <div className="px-3 py-1 rounded-full bg-red-600/80 backdrop-blur-md border border-red-400/30 text-white font-extrabold text-[11px] sm:text-xs flex items-center gap-1 shadow-lg">
                <Zap className="w-3.5 h-3.5 text-yellow-300" />
                <span>অটো ডেলিভারি</span>
              </div>
            </div>

            {/* Bottom Title on Banner */}
            <div className="absolute bottom-3 sm:bottom-6 left-0 right-0 text-center px-4">
              <h1 className="text-xl sm:text-3xl font-black tracking-widest text-white uppercase drop-shadow-lg">
                {settings.heroTitle || "SONIC'S E-SHOP"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 font-semibold drop-shadow-md">
                {settings.heroSubtitle || 'Game Top-Up & Digital Goods BD'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

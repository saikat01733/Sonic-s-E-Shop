'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Zap, Flame, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

interface SlideItem {
  id: string;
  gameId: string;
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  deliveryTime: string;
  image: string;
  color: string;
}

const slides: SlideItem[] = [
  {
    id: 'slide-efootball',
    gameId: 'efootball',
    slug: 'efootball-coin',
    title: 'eFootball™ 2026 Coins',
    subtitle: 'Official Konami In-Game Coins with exclusive bonus packs & 100% guarantee.',
    badge: 'HOT TOP-UP',
    deliveryTime: '1-10 MINS',
    image: '/assets/efootball.jpg',
    color: '#0284c7',
  },
  {
    id: 'slide-pubg',
    gameId: 'pubg',
    slug: 'pubg-mobile-uc',
    title: 'PUBG Mobile Unknown Cash',
    subtitle: 'Instant direct Player ID (UID) delivery with Royal Pass & Lucky Spin UC packs.',
    badge: 'INSTANT DELIVERY',
    deliveryTime: '1-5 MINS',
    image: '/assets/pubg.jpg',
    color: '#0284c7',
  },
  {
    id: 'slide-roblox',
    gameId: 'roblox',
    slug: 'roblox-robux',
    title: 'Roblox Robux VIP Top-Up',
    subtitle: 'Safe in-game Robux delivery via username with zero account risk or password required.',
    badge: '100% SAFE',
    deliveryTime: '5-15 MINS',
    image: '/assets/roblox.jpg',
    color: '#06b6d4',
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const nextSlide = () => setCurrent(prev => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent(prev => (prev - 1 + slides.length) % slides.length);

  const activeSlide = slides[current];

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Card variant="glass" className="relative p-0 overflow-hidden border-cyan-500/25 shadow-2xl group rounded-3xl">
        {/* Adaptive Height Container: Mobile min-h-[380px] to prevent text overlap; Desktop aspect-[24/8] */}
        <div className="relative min-h-[380px] sm:min-h-[420px] md:min-h-0 md:aspect-[24/8] w-full overflow-hidden bg-black/60 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <img
                src={activeSlide.image}
                alt={activeSlide.title}
                className="w-full h-full object-cover"
                onError={(e: any) => (e.target.src = '/banner.jpg')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020914] via-[#020914]/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#020914]/90 via-[#020914]/40 to-[#020914]/90" />
            </motion.div>
          </AnimatePresence>

          {/* Badges Top Left & Right */}
          <div className="absolute top-3.5 left-3.5 sm:top-6 sm:left-6 flex items-center gap-2 z-20">
            <div className="liquid-glass-pill px-3 py-1 text-white font-extrabold text-[10px] sm:text-xs flex items-center gap-1.5 shadow-lg border-cyan-400/40">
              <Flame className="w-3.5 h-3.5 text-cyan-400" />
              <span>{activeSlide.badge}</span>
            </div>
          </div>

          <div className="absolute top-3.5 right-3.5 sm:top-6 sm:right-6 z-20">
            <div className="px-3 py-1 rounded-full bg-cyan-600/80 backdrop-blur-xl border border-cyan-400/40 text-white font-extrabold text-[10px] sm:text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-600/30">
              <Zap className="w-3.5 h-3.5 text-cyan-300" />
              <span>⚡ {activeSlide.deliveryTime}</span>
            </div>
          </div>

          {/* Centered Content with Fluid Typography */}
          <div className="relative z-20 text-center px-3 sm:px-8 max-w-3xl mx-auto space-y-2 py-10 sm:py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id + '-text'}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-1.5 sm:space-y-2"
              >
                <h1 className="text-base sm:text-2xl md:text-4xl lg:text-5xl font-black tracking-wide text-white uppercase drop-shadow-2xl font-display leading-snug break-words px-2">
                  {activeSlide.title}
                </h1>
                <p className="text-[11px] sm:text-xs md:text-sm text-gray-200 font-medium drop-shadow-lg max-w-xl mx-auto line-clamp-2 px-2">
                  {activeSlide.subtitle}
                </p>
                <div className="pt-1.5 sm:pt-2 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                  <Link href={`/games/${activeSlide.slug}`}>
                    <Button variant="primary" size="sm" icon={<ArrowRight className="w-3 h-3" />}>
                      Top-Up Now
                    </Button>
                  </Link>
                  <Link href="/games">
                    <Button variant="pill" size="sm">
                      All Games
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Chevron Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-1.5 sm:left-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer z-30"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-1.5 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer z-30"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Slide Indicator Dots */}
          <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2 z-30">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrent(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  current === idx
                    ? 'w-6 h-1.5 bg-cyan-400 shadow-md shadow-cyan-400/50'
                    : 'w-2 h-1.5 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

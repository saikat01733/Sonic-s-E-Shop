'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import FloatingToast from '@/components/common/FloatingToast';
import { GameCard } from '@/components/features/games/game-card';
import { HeroSlider } from '@/components/features/home/hero-slider';
import { CouponTicket } from '@/components/features/coupons/coupon-ticket';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSiteData } from '@/hooks/use-site-data';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import {
  Zap,
  ShieldCheck,
  Headphones,
  Users,
  Flame,
  ArrowRight,
  Tag,
  RefreshCw,
  Clock,
  Gamepad2,
  Trophy
} from 'lucide-react';

export default function HomeShowcasePage() {
  const { settings, trustBadges, games, coupons, loading } = useSiteData();
  const { toast, showToast, dismissToast } = useToast();
  const { t, locale } = useLanguage();

  const getTrustIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'shield':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'zap':
        return <Zap className="w-5 h-5 text-cyan-400" />;
      case 'headset':
        return <Headphones className="w-5 h-5 text-cyan-400" />;
      case 'users':
        return <Users className="w-5 h-5 text-purple-400" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white text-xs">
        <RefreshCw className="w-7 h-7 animate-spin text-cyan-400 mb-2" />
        <span className="font-bold tracking-wider">{t('siteName')} Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between overflow-x-hidden w-full max-w-full">
      {/* Floating Apple Liquid Glass Pill Navbar */}
      <Navbar settings={settings} games={games} />

      <main className="flex-1 w-full space-y-10 pb-12 overflow-x-hidden max-w-full">
        {/* 1. HIGH-CONTRAST LIVE NOTICE TICKER */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-3.5 sm:pt-4">
          <div className="live-notice-capsule rounded-full py-1.5 px-3 sm:px-4 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-extrabold text-[11px] sm:text-xs bg-[oklch(45.5%_0.188_13.697_/_0.20)] border border-[oklch(45.5%_0.188_13.697_/_0.45)] text-[oklch(68%_0.19_13.697)] [html.light-theme_&]:text-[oklch(45.5%_0.188_13.697)] px-2.5 py-0.5 rounded-full flex-shrink-0 uppercase shadow-sm">
              <Zap className="w-3.5 h-3.5 text-[oklch(68%_0.19_13.697)] [html.light-theme_&]:text-[oklch(45.5%_0.188_13.697)] animate-pulse" />
              <span>{t('liveNotice')}:</span>
            </div>
            <div className="overflow-hidden relative w-full text-xs font-bold text-white [html.light-theme_&]:text-slate-900 tracking-wide min-w-0">
              <div className="animate-marquee">
                <span className="mr-12">{settings.tickerText}</span>
                <span className="mr-12">{settings.tickerText}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. INTERACTIVE HERO SLIDER (3 CORE GAMES) */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <HeroSlider slides={settings?.slides} />
        </section>

        {/* 3. TRENDING GAMES SHOWCASE (3 CORE GAMES) */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/15 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Trophy className="w-4 h-4" />
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  {t('trendingGames')}
                </h2>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                Instant delivery with 100% account guarantee via bKash & Nagad
              </p>
            </div>
            <Link
              href="/games"
              className="text-xs font-extrabold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group transition-colors"
            >
              <span>{t('navGames')} ({games.length})</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>

        {/* 3. PERFORATED LIQUID GLASS VOUCHERS */}
        {coupons.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <Tag className="w-4 h-4" />
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                    {t('couponTitle')}
                  </h2>
                </div>
                <p className="text-xs text-gray-300 mt-0.5">
                  {t('couponSubtitle')}
                </p>
              </div>
              <Link
                href="/coupons"
                className="text-xs font-extrabold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group transition-colors"
              >
                <span>{t('viewOffers')}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {coupons.slice(0, 3).map(coupon => (
                <CouponTicket
                  key={coupon.id}
                  coupon={coupon}
                  onCopyNotice={code => showToast(t('couponApplied'), `${code} ${t('copiedBtn')}`, '🎟️')}
                />
              ))}
            </div>
          </section>
        )}

        {/* 4. APPLE-STYLE BENTO GRID: WHY CHOOSE US */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="border-b border-white/15 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              {t('whyChooseUs')}
            </h2>
            <p className="text-xs text-gray-300 mt-0.5">
              Built on transparency, speed, and dedicated gamer security
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trustBadges.map((badge, idx) => (
              <Card
                key={badge.id || idx}
                variant="glass"
                hoverable
                className="p-5 flex flex-col justify-between space-y-3 border-white/20"
              >
                <div className="w-10 h-10 rounded-2xl bg-white/[0.08] border border-white/20 flex items-center justify-center shadow-lg shadow-black/40">
                  {getTrustIcon(badge.icon)}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{badge.title}</h3>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">{badge.sub}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Modern Liquid Glass Footer */}
      <Footer settings={settings} />

      {/* Dynamic Toast Notification */}
      <FloatingToast
        toast={toast}
        onClose={dismissToast}
      />
    </div>
  );
}

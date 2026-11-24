'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import FloatingToast from '@/components/common/FloatingToast';
import { GameCard } from '@/components/features/games/game-card';
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
  Sparkles
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
        return <Zap className="w-5 h-5 text-amber-400" />;
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
        <RefreshCw className="w-7 h-7 animate-spin text-red-500 mb-2" />
        <span className="font-bold tracking-wider">{t('siteName')} Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Floating Apple Liquid Glass Pill Navbar */}
      <Navbar settings={settings} games={games} />

      <main className="flex-1 w-full space-y-12 pb-12">
        {/* 1. HERO SHOWCASE */}
        <section className="space-y-4 pt-2">
          {/* Ticker */}
          <div className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white py-1 px-4 overflow-hidden shadow-lg shadow-red-600/25">
            <div className="max-w-6xl mx-auto flex items-center">
              <div className="flex items-center gap-1 font-extrabold text-[11px] sm:text-xs bg-black/40 px-2.5 py-0.5 rounded-full mr-3 flex-shrink-0 uppercase backdrop-blur-md">
                <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>{t('liveNotice')}:</span>
              </div>
              <div className="overflow-hidden relative w-full text-xs font-semibold tracking-wide">
                <div className="animate-marquee">
                  <span className="mr-12">{settings.tickerText}</span>
                  <span className="mr-12">{settings.tickerText}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Banner with Specular Liquid Glass Overlays */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <Card variant="glass" className="relative overflow-hidden p-0 border border-white/20 shadow-2xl group">
              <div className="relative aspect-[21/9] sm:aspect-[24/8] w-full overflow-hidden bg-black/50">
                <img
                  src={settings.heroBanner || '/banner.webp'}
                  alt={settings.heroTitle}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                  onError={(e: any) => (e.target.src = '/banner.jpg')}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06080d] via-black/35 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#06080d]/80 via-transparent to-[#06080d]/80" />

                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2">
                  <div className="liquid-glass-pill px-3.5 py-1 text-white font-extrabold text-[11px] sm:text-xs flex items-center gap-1.5 shadow-lg">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('instantTopup')}</span>
                  </div>
                </div>

                <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                  <div className="px-3.5 py-1 rounded-full bg-red-600/80 backdrop-blur-xl border border-red-400/40 text-white font-extrabold text-[11px] sm:text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/30">
                    <Zap className="w-3.5 h-3.5 text-yellow-300" />
                    <span>{t('deliverySpeed')}</span>
                  </div>
                </div>

                <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 text-center px-4">
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-widest text-white uppercase drop-shadow-2xl">
                    {settings.heroTitle}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-200 font-semibold mt-1 drop-shadow-lg">
                    {settings.heroSubtitle}
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <Link href="/games">
                      <Button variant="primary" size="md" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                        {t('browseGames')}
                      </Button>
                    </Link>
                    <Link href="/coupons">
                      <Button variant="pill" size="md">
                        {t('viewOffers')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* 2. TRENDING GAMES SHOWCASE */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/15 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-red-500/20 text-red-400">
                  <Sparkles className="w-4 h-4" />
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
              className="text-xs font-extrabold text-red-400 hover:text-red-300 flex items-center gap-1 group transition-colors"
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
                  <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
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
                className="text-xs font-extrabold text-amber-400 hover:text-amber-300 flex items-center gap-1 group transition-colors"
              >
                <span>{t('viewOffers')} →</span>
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

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
import {
  Zap,
  ShieldCheck,
  Headphones,
  Users,
  Flame,
  ArrowRight,
  Tag,
  RefreshCw,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function HomeShowcasePage() {
  const { settings, trustBadges, games, coupons, loading } = useSiteData();
  const { toast, showToast, dismissToast } = useToast();

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
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center text-white text-xs">
        <RefreshCw className="w-6 h-6 animate-spin text-red-500 mb-2" />
        <span>Sonic's E-Shop লোড হচ্ছে...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Floating Liquid Glass Pill Navbar */}
      <Navbar settings={settings} games={games} />

      <main className="flex-1 w-full space-y-12 pb-12">
        {/* 1. HERO SHOWCASE */}
        <section className="space-y-4 pt-2">
          {/* Ticker */}
          <div className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white py-1 px-4 overflow-hidden shadow-lg">
            <div className="max-w-6xl mx-auto flex items-center">
              <div className="flex items-center gap-1 font-bold text-xs bg-black/40 px-2 py-0.5 rounded-full mr-3 flex-shrink-0 uppercase">
                <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>লাইভ নোটিশ:</span>
              </div>
              <div className="overflow-hidden relative w-full text-xs font-medium tracking-wide">
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#07090e]/85 via-transparent to-[#07090e]/85" />

                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2">
                  <div className="liquid-glass-pill px-3.5 py-1 text-white font-extrabold text-[11px] sm:text-xs flex items-center gap-1.5 shadow-lg">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>২৪/৭ ইনস্ট্যান্ট টপ-আপ</span>
                  </div>
                </div>

                <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                  <div className="px-3.5 py-1 rounded-full bg-red-600/80 backdrop-blur-md border border-red-400/30 text-white font-extrabold text-[11px] sm:text-xs flex items-center gap-1.5 shadow-lg">
                    <Zap className="w-3.5 h-3.5 text-yellow-300" />
                    <span>১-১০ মিনিট ডেলিভারি</span>
                  </div>
                </div>

                <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 text-center px-4">
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-widest text-white uppercase drop-shadow-xl">
                    {settings.heroTitle}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-200 font-semibold mt-1 drop-shadow-md">
                    {settings.heroSubtitle}
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <Link href="/games">
                      <Button variant="primary" size="md" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                        গেম ব্রাউজ করুন
                      </Button>
                    </Link>
                    <Link href="/coupons">
                      <Button variant="pill" size="md">
                        অফার ও কুপন দেখুন
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* 2. TRUST BADGES */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {trustBadges.map(b => (
              <Card
                key={b.id}
                variant="glass"
                hoverable
                className="p-3.5 flex items-center gap-3 border-white/10 hover:border-white/25"
              >
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0 shadow-inner">
                  {getTrustIcon(b.icon)}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-black text-white truncate">{b.title}</div>
                  <div className="text-[10px] text-gray-400 truncate">{b.sub}</div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* 3. TRENDING GAMES SHOWCASE (Using Reusable GameCard) */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-red-500 font-extrabold text-xs uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5" />
                <span>জনপ্রিয় ট্রেন্ডিং</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                গেমিং টপ-আপ কালেকশন
              </h2>
            </div>

            <Link
              href="/games"
              className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
            >
              <span>সকল গেম ({games.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {games.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>

        {/* 4. LIVE TOP-UP ACTIVITY FEED */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <Card variant="glass" className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-white/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0 animate-pulse">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>লাইভ টপ-আপ ডেলিভারি ফিড</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  সদ্য সফলভাবে ডেলিভারি হয়েছে: <strong>Player 0173*** • 660 UC (PUBG Mobile)</strong>
                </div>
              </div>
            </div>

            <Link href="/orders">
              <Button variant="pill" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                অর্ডার স্ট্যাটাস চেক করুন
              </Button>
            </Link>
          </Card>
        </section>

        {/* 5. EXCLUSIVE COUPONS (Using Reusable CouponTicket) */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5" />
                <span>ডিসকাউন্ট অফার</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                বিশেষ কুপন ভাউচার
              </h2>
            </div>

            <Link
              href="/coupons"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
            >
              <span>সকল কুপন ({coupons.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {coupons.slice(0, 3).map(coupon => (
              <CouponTicket
                key={coupon.id}
                coupon={coupon}
                onCopyNotice={code =>
                  showToast('কুপন কোড কপি হয়েছে!', `কোড: ${code} কপি হয়েছে! চেকআউটে পেস্ট করুন।`, '🎟️')
                }
              />
            ))}
          </div>
        </section>

        {/* 6. BENTO GRID */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              কেন Sonic's E-Shop বাংলাদেশের সেরা?
            </h2>
            <p className="text-xs text-gray-400">
              হাজারো গেমারের প্রথম পছন্দ ১০০% অফিশিয়াল ও নিরাপদ গেমিং সার্ভিস
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="glass" className="p-6 space-y-2 md:col-span-2">
              <div className="w-10 h-10 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-white">১০০% অফিশিয়াল ও সেফ টপ-আপ গ্যারান্টি</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                কোনো তৃতীয় পক্ষ বা মড নয় — সম্পূর্ণ অফিশিয়াল পার্টনার গেটওয়ে দিয়ে টপ-আপ সম্পন্ন হয়। আপনার আইডি ব্যান হওয়ার শূন্য ঝুঁকি।
              </p>
            </Card>

            <Card variant="glass" className="p-6 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-2">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-white">১-১০ মিনিট ফাস্ট ডেলিভারি</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                পেমেন্ট কনফার্মেশনের সাথে সাথেই অটোমেটেড বট ও অভিজ্ঞ টিম দ্বারা দ্রুত কয়েন ও ইউসি ডেলিভারি।
              </p>
            </Card>

            <Card variant="glass" className="p-6 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-2">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-white">২৪/৭ সরাসরি হোয়াটসঅ্যাপ হেল্প</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                অর্ডারে যেকোনো সমস্যা হলে লাইভ হেল্পলাইনে তাৎক্ষণিক রেসপন্স পাবেন।
              </p>
            </Card>

            <Card variant="glass" className="p-6 space-y-2 md:col-span-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-2">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-white">১,০০,০০০+ সন্তুষ্ট বাংলাদেশি গেমার</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                বিকাশ ও নগদে সহজ পেমেন্ট, স্বচ্ছ মূল্য তালিকা এবং ডিজিটাল রসিদ সেবা দিয়ে দেশের সর্ববৃহৎ গেমিং পরিবার।
              </p>
            </Card>
          </div>
        </section>
      </main>

      <Footer settings={settings} />

      <FloatingToast
        toast={toast}
        onClose={dismissToast}
      />
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import FloatingToast, { ToastMessage } from '@/components/storefront/FloatingToast';
import { GameItem, SiteSettings, CouponItem, TrustBadge } from '@/lib/types';
import {
  Zap,
  ShieldCheck,
  Headphones,
  Users,
  Flame,
  ArrowRight,
  Sparkles,
  Gamepad2,
  Tag,
  Star,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function HomeShowcasePage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [trustBadges, setTrustBadges] = useState<TrustBadge[]>([]);
  const [games, setGames] = useState<GameItem[]>([]);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    fetch('/api/site-data')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setSettings(json.data.settings);
          setTrustBadges(json.data.trustBadges);
          setGames(json.data.games);
          setCoupons(json.data.coupons);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCopyCoupon = (coupon: CouponItem) => {
    navigator.clipboard.writeText(coupon.code);
    setCopiedId(coupon.id);
    setTimeout(() => setCopiedId(null), 2500);

    setToast({
      id: String(Date.now()),
      title: 'কুপন কোড কপি হয়েছে!',
      desc: `কোড: ${coupon.code} (৳${coupon.discount} ছাড়) কপি হয়েছে! টপ-আপ পেজে ব্যবহার করুন।`,
      icon: '🎟️'
    });
  };

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

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center text-white text-xs">
        <RefreshCw className="w-6 h-6 animate-spin text-red-500 mb-2" />
        <span>Sonic's E-Shop লোড হচ্ছে...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Floating Apple Liquid Glass Pill Navbar */}
      <Navbar settings={settings} games={games} />

      <main className="flex-1 w-full space-y-12 pb-12">
        {/* ==================================================== */}
        {/* 1. HERO SHOWCASE WITH LIQUID GLASS */}
        {/* ==================================================== */}
        <section className="space-y-4 pt-2">
          {/* Announcement Ticker */}
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

          {/* Hero Banner with Liquid Glass Overlays */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="relative rounded-3xl overflow-hidden liquid-glass border border-white/20 shadow-2xl group">
              <div className="relative aspect-[21/9] sm:aspect-[24/8] w-full overflow-hidden bg-black/50">
                <img
                  src={settings.heroBanner || '/banner.webp'}
                  alt={settings.heroTitle}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                  onError={(e: any) => (e.target.src = '/banner.jpg')}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#07090e]/85 via-transparent to-[#07090e]/85" />

                {/* Floating Top Badges */}
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

                {/* Banner Headline Typography */}
                <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 text-center px-4">
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-widest text-white uppercase drop-shadow-xl">
                    {settings.heroTitle}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-200 font-semibold mt-1 drop-shadow-md">
                    {settings.heroSubtitle}
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <Link
                      href="/games"
                      className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg shadow-red-600/30 flex items-center gap-1.5 transition-all hover:scale-105"
                    >
                      <span>গেম ব্রাউজ করুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href="/coupons"
                      className="liquid-glass-pill px-5 py-2.5 text-white font-bold text-xs hover:bg-white/15 transition-all"
                    >
                      <span>অফার ও কুপন দেখুন</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================== */}
        {/* 2. TRUST BADGES (APPLE BENTO) */}
        {/* ==================================================== */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {trustBadges.map(b => (
              <div
                key={b.id}
                className="liquid-glass p-3.5 flex items-center gap-3 border border-white/10 hover:border-white/25 transition-all hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0 shadow-inner">
                  {getTrustIcon(b.icon)}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-black text-white truncate">{b.title}</div>
                  <div className="text-[10px] text-gray-400 truncate">{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================== */}
        {/* 3. TRENDING GAMES SHOWCASE (3D LIQUID GLASS) */}
        {/* ==================================================== */}
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

          {/* 3D Liquid Glass Cards linking directly to /games/[slug] */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {games.map(game => (
              <Link
                key={game.id}
                href={`/games/${game.slug}`}
                className="liquid-glass liquid-glass-hover overflow-hidden group flex flex-col justify-between transition-all"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/60">
                  <img
                    src={game.poster}
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    onError={(e: any) => (e.target.src = '/banner.jpg')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1018] via-black/20 to-transparent" />

                  {/* Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white shadow-lg"
                      style={{ backgroundColor: game.badge_color }}
                    >
                      {game.badge}
                    </span>
                  </div>

                  {/* Speed Badge */}
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-amber-300 font-bold text-[10px] flex items-center gap-1 border border-white/15">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>{game.delivery_time}</span>
                  </div>
                </div>

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
              </Link>
            ))}
          </div>
        </section>

        {/* ==================================================== */}
        {/* 4. LIVE TOP-UP ACTIVITY FEED */}
        {/* ==================================================== */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="liquid-glass p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/15">
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

            <Link
              href="/orders"
              className="liquid-glass-pill px-4 py-2 text-xs font-bold text-white hover:bg-white/15 flex items-center gap-1.5 transition-all flex-shrink-0"
            >
              <span>অর্ডার স্ট্যাটাস চেক করুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* ==================================================== */}
        {/* 5. EXCLUSIVE COUPONS PREVIEW */}
        {/* ==================================================== */}
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
            {coupons.slice(0, 3).map(coupon => {
              const isCopied = copiedId === coupon.id;

              return (
                <div
                  key={coupon.id}
                  className="liquid-glass p-4 relative overflow-hidden flex flex-col justify-between space-y-3"
                >
                  <div className="coupon-notch-left" />
                  <div className="coupon-notch-right" />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                        ৳{coupon.discount} ছাড়
                      </span>
                      <span className="text-[10px] text-gray-400">মিন: ৳{coupon.minSpend}</span>
                    </div>

                    <div className="text-base font-black tracking-widest text-white font-mono bg-white/5 py-1.5 px-3 rounded-xl border border-white/10 text-center my-2">
                      {coupon.code}
                    </div>

                    <p className="text-[11px] text-gray-300 leading-snug">
                      {coupon.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopyCoupon(coupon)}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isCopied
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-white/10 hover:bg-emerald-500 hover:text-white text-gray-200'
                    }`}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'কপি হয়েছে!' : 'কোড কপি করুন'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ==================================================== */}
        {/* 6. APPLE BENTO (WHY CHOOSE US) */}
        {/* ==================================================== */}
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
            <div className="liquid-glass p-6 space-y-2 md:col-span-2">
              <div className="w-10 h-10 rounded-2xl bg-red-500/15 text-red-400 flex items-center justify-center mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-white">১০০% অফিশিয়াল ও সেফ টপ-আপ গ্যারান্টি</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                কোনো তৃতীয় পক্ষ বা মড নয় — সম্পূর্ণ অফিশিয়াল পার্টনার গেটওয়ে দিয়ে টপ-আপ সম্পন্ন হয়। আপনার আইডি ব্যান হওয়ার শূন্য ঝুঁকি।
              </p>
            </div>

            <div className="liquid-glass p-6 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-2">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-white">১-১০ মিনিট ফাস্ট ডেলিভারি</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                পেমেন্ট কনফার্মেশনের সাথে সাথেই অটোমেটেড বট ও অভিজ্ঞ টিম দ্বারা দ্রুত কয়েন ও ইউসি ডেলিভারি।
              </p>
            </div>

            <div className="liquid-glass p-6 space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-2">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-white">২৪/৭ সরাসরি হোয়াটসঅ্যাপ হেল্প</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                অর্ডারে যেকোনো সমস্যা হলে লাইভ হেল্পলাইনে তাৎক্ষণিক রেসপন্স পাবেন।
              </p>
            </div>

            <div className="liquid-glass p-6 space-y-2 md:col-span-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-2">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-white">১,০০,০০০+ সন্তুষ্ট বাংলাদেশি গেমার</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                বিকাশ ও নগদে সহজ পেমেন্ট, স্বচ্ছ মূল্য তালিকা এবং ডিজিটাল রসিদ সেবা দিয়ে দেশের সর্ববৃহৎ গেমিং পরিবার।
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={settings} />

      <FloatingToast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

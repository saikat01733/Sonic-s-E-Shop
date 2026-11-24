'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import FloatingToast, { ToastMessage } from '@/components/storefront/FloatingToast';
import { CouponItem, SiteSettings, GameItem } from '@/lib/types';
import { Tag, Check, Copy, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [games, setGames] = useState<GameItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    fetch('/api/site-data')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setCoupons(json.data.coupons);
          setGames(json.data.games);
          setSettings(json.data.settings);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (coupon: CouponItem) => {
    navigator.clipboard.writeText(coupon.code);
    setCopiedId(coupon.id);
    setTimeout(() => setCopiedId(null), 2500);

    setToast({
      id: String(Date.now()),
      title: 'কুপন কোড কপি হয়েছে!',
      desc: `কোড: ${coupon.code} (৳${coupon.discount} ছাড়) ক্লিপবোর্ডে কপি করা হয়েছে! চেকআউটে পেস্ট করুন।`,
      icon: '🎟️'
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar settings={settings || undefined} games={games} />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 mt-8 w-full">
        {/* Header Banner */}
        <div className="liquid-glass p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs mb-3">
              <Tag className="w-3.5 h-3.5" />
              <span>এক্সক্লুসিভ অফার ও ক্যাশব্যাক</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              বিশেষ কুপন ভাউচার ও ডিসকাউন্ট কোড
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
              যেকোনো গেম টপ-আপ অর্ডারে ক্যাশ ছাড় পেতে নিচের কুপন কোডগুলো কপি করুন এবং চেকআউটের সময় প্রোমো বক্সে প্রয়োগ করুন।
            </p>
          </div>
        </div>

        {/* Coupons Grid */}
        {loading ? (
          <div className="py-20 text-center text-white text-xs flex flex-col items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-red-500 mb-2" />
            <span>কুপনসমূহ লোড হচ্ছে...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {coupons.map(coupon => {
              const isCopied = copiedId === coupon.id;

              return (
                <div
                  key={coupon.id}
                  className="liquid-glass p-5 flex flex-col justify-between space-y-4 relative overflow-hidden border border-white/15 hover:border-emerald-500/40 transition-all hover:-translate-y-1"
                >
                  <div className="coupon-notch-left" />
                  <div className="coupon-notch-right" />

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ৳{coupon.discount} ফ্ল্যাট ছাড়
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        মিনিমাম ৳{coupon.minSpend}
                      </span>
                    </div>

                    <div className="text-lg font-black tracking-widest text-white font-mono bg-white/5 py-2 px-3 rounded-2xl border border-white/10 text-center my-3 shadow-inner">
                      {coupon.code}
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed">
                      {coupon.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => handleCopy(coupon)}
                      className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                        isCopied
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-white/10 hover:bg-emerald-500 hover:text-white text-gray-200'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>✓ কোড কপি হয়েছে!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>ক্লিক করে কপি করুন</span>
                        </>
                      )}
                    </button>

                    <Link
                      href="/games"
                      className="w-full py-2 rounded-xl text-[11px] font-bold text-gray-400 hover:text-white text-center block transition-colors"
                    >
                      গেম শপে ব্যবহার করুন →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer settings={settings || undefined} />

      <FloatingToast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

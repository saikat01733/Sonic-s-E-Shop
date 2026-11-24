'use client';

import React, { useState } from 'react';
import { CouponItem } from '@/lib/types';
import { Tag, Check, Copy, Sparkles } from 'lucide-react';

interface CouponsSectionProps {
  coupons: CouponItem[];
  onApplyCoupon: (code: string) => void;
  onShowToast: (title: string, desc: string, icon?: string) => void;
}

export default function CouponsSection({ coupons, onApplyCoupon, onShowToast }: CouponsSectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (coupon: CouponItem) => {
    navigator.clipboard.writeText(coupon.code);
    setCopiedId(coupon.id);
    setTimeout(() => setCopiedId(null), 2500);

    onApplyCoupon(coupon.code);
    onShowToast('কুপন কপি ও অ্যাপ্লাই হয়েছে!', `কোড: ${coupon.code} (৳${coupon.discount} ছাড়) স্বয়ংক্রিয়ভাবে অ্যাপ্লাই করা হয়েছে!`, '🎟️');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 mt-8">
      <div className="mb-4">
        <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
          <Tag className="w-4 h-4 text-emerald-400" />
          বিশেষ অফার ও ডিসকাউন্ট কুপন (Redeem Codes)
        </h2>
        <p className="text-xs text-gray-400">যেকোনো কোড কপি করে ইনস্ট্যান্ট ছাড় উপভোগ করুন</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {coupons.map(coupon => {
          const isCopied = copiedId === coupon.id;

          return (
            <div
              key={coupon.id}
              className="relative rounded-2xl glass-panel border border-white/10 overflow-hidden flex flex-col justify-between p-4 group hover:border-emerald-500/40 transition-all hover:-translate-y-0.5"
            >
              {/* Notches for Perforated Ticket Look */}
              <div className="coupon-notch-left" />
              <div className="coupon-notch-right" />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    ৳{coupon.discount} ফ্ল্যাট ছাড়
                  </span>
                  <span className="text-[10px] text-gray-400">মিনিমাম অর্ডার ৳{coupon.minSpend}</span>
                </div>

                <div className="text-base font-black tracking-widest text-white font-mono bg-white/5 py-1.5 px-3 rounded-xl border border-white/10 text-center mb-2">
                  {coupon.code}
                </div>

                <p className="text-xs text-gray-300 leading-relaxed mb-3">
                  {coupon.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(coupon)}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isCopied
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-white/10 hover:bg-emerald-500 hover:text-white text-gray-200'
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>✓ কপি ও অ্যাপ্লাই হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>কোড কপি করুন</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

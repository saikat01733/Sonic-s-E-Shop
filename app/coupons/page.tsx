'use client';

import React from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import FloatingToast from '@/components/common/FloatingToast';
import { CouponTicket } from '@/components/features/coupons/coupon-ticket';
import { Card } from '@/components/ui/card';
import { useSiteData } from '@/hooks/use-site-data';
import { useToast } from '@/hooks/use-toast';
import { Tag, RefreshCw } from 'lucide-react';

export default function CouponsPage() {
  const { coupons, games, settings, loading } = useSiteData();
  const { toast, showToast, dismissToast } = useToast();

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar settings={settings} games={games} />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 mt-8 w-full">
        <Card variant="glass" className="p-6 sm:p-8 mb-8 relative overflow-hidden">
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
        </Card>

        {loading ? (
          <div className="py-20 text-center text-white text-xs flex flex-col items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-red-500 mb-2" />
            <span>কুপনসমূহ লোড হচ্ছে...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {coupons.map(coupon => (
              <CouponTicket
                key={coupon.id}
                coupon={coupon}
                onCopyNotice={code =>
                  showToast('কুপন কোড কপি হয়েছে!', `কোড: ${code} কপি হয়েছে! চেকআউটে পেস্ট করুন।`, '🎟️')
                }
              />
            ))}
          </div>
        )}
      </main>

      <Footer settings={settings} />

      <FloatingToast
        toast={toast}
        onClose={dismissToast}
      />
    </div>
  );
}

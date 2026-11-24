'use client';

import React from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import FloatingToast from '@/components/common/FloatingToast';
import { CouponTicket } from '@/components/features/coupons/coupon-ticket';
import { Card } from '@/components/ui/card';
import { useSiteData } from '@/hooks/use-site-data';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import { Tag, RefreshCw } from 'lucide-react';

export default function CouponsPage() {
  const { coupons, games, settings, loading } = useSiteData();
  const { toast, showToast, dismissToast } = useToast();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar settings={settings} games={games} />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 mt-8 w-full">
        <Card variant="glass" className="p-6 sm:p-8 mb-8 relative overflow-hidden border-white/20">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/35 text-emerald-300 font-bold text-xs mb-3 backdrop-blur-md">
              <Tag className="w-3.5 h-3.5" />
              <span>{t('navCoupons')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              {t('couponTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
              {t('couponSubtitle')}
            </p>
          </div>
        </Card>

        {loading ? (
          <div className="py-20 text-center text-white text-xs flex flex-col items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-red-500 mb-2" />
            <span>Loading Coupons...</span>
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm">
            {t('noResults')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {coupons.map(coupon => (
              <CouponTicket
                key={coupon.id}
                coupon={coupon}
                onCopyNotice={code =>
                  showToast(t('couponApplied'), `${code} ${t('copiedBtn')}`, '🎟️')
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

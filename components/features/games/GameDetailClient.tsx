'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import InvoiceModal from '@/components/common/InvoiceModal';
import FloatingToast from '@/components/common/FloatingToast';
import { PackageSelector } from '@/components/features/games/package-selector';
import { PaymentBox } from '@/components/features/checkout/payment-box';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import { GameItem, PackageItem, SiteSettings, CouponItem, OrderItem } from '@/lib/types';
import {
  Zap,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react';

interface GameDetailClientProps {
  initialGame: GameItem;
  allGames: GameItem[];
  settings: SiteSettings;
  coupons: CouponItem[];
}

export default function GameDetailClient({
  initialGame,
  allGames,
  settings,
  coupons,
}: GameDetailClientProps) {
  const [game, setGame] = useState<GameItem>(initialGame);
  const [formData, setFormData] = useState<Record<string, string>>({ device: 'Android' });
  const [selectedPackages, setSelectedPackages] = useState<PackageItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<OrderItem | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { toast, showToast, dismissToast } = useToast();
  const { t, locale } = useLanguage();

  const togglePackage = (pkg: PackageItem) => {
    if (!pkg.stock) {
      showToast(t('outOfStock'), 'This package is currently out of stock!', '⚠️');
      return;
    }
    if (selectedPackages.find(p => p.id === pkg.id)) {
      setSelectedPackages(selectedPackages.filter(p => p.id !== pkg.id));
    } else {
      setSelectedPackages([...selectedPackages, pkg]);
    }
  };

  const subtotal = selectedPackages.reduce((sum, p) => sum + (p.price || 0), 0);

  const handleApplyCoupon = (code: string) => {
    const norm = (code || '').trim().toUpperCase();
    const match = coupons.find(c => c.code.toUpperCase() === norm && c.active);

    if (!match) {
      showToast('Invalid Coupon', 'The coupon code entered is invalid or expired.', '❌');
      return;
    }

    if (subtotal < match.minSpend) {
      showToast('Minimum Spend Required', `Minimum order value for ${match.code} is ৳${match.minSpend}`, '⚠️');
      return;
    }

    setAppliedCoupon(match);
    showToast(t('couponApplied'), `${match.code} applied! Saved ৳${match.discount}`, '🎟️');
  };

  const handleSubmitOrder = async (method: 'bKash' | 'Nagad' | 'Wallet', lastDigits: string) => {
    if (!game) return;

    if (selectedPackages.length === 0) {
      showToast('Select Package', t('selectPackagePrompt'), '⚠️');
      return;
    }

    if (method !== 'Wallet' && (!lastDigits || lastDigits.trim().length < 4)) {
      showToast('Missing Payment Info', 'Please enter your last 4 digits or TrxID.', '⚠️');
      return;
    }

    const discount = appliedCoupon ? appliedCoupon.discount : 0;
    const grandTotal = Math.max(0, subtotal - discount);

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: game.id,
          gameName: game.name,
          packageIds: selectedPackages.map(p => p.id),
          packages: selectedPackages,
          totalAmount: grandTotal,
          paymentMethod: method,
          senderLastDigits: method === 'Wallet' ? 'WALLET' : lastDigits.trim(),
          couponCode: appliedCoupon?.code,
          customData: formData,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Order Placed Successfully!', `Order ID: ${json.order.id}. Delivery in 1-10 mins.`, '✅');
        setViewingOrder(json.order);
        setSelectedPackages([]);
      } else {
        showToast('Order Failed', json.error || 'Failed to place order.', '❌');
      }
    } catch (e: any) {
      showToast('Error', e.message || 'Network error. Please try again.', '❌');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar settings={settings} games={allGames} />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 mt-6 w-full space-y-8 pb-12">
        {/* Widescreen Game Header Banner */}
        <Card variant="glass" className="overflow-hidden p-0 border border-white/20">
          <div className="relative aspect-[21/9] sm:aspect-[24/7] w-full overflow-hidden bg-black/50">
            <img
              src={game.poster}
              alt={game.name}
              className="w-full h-full object-cover"
              onError={(e: any) => (e.target.src = '/banner.webp')}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06080d] via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#06080d]/80 via-transparent to-[#06080d]/80" />

            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 flex flex-col sm:flex-row sm:items-end justify-between right-4 sm:right-6 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white shadow-md backdrop-blur-md"
                    style={{ backgroundColor: `${game.badge_color}90`, border: `1px solid ${game.badge_color}` }}
                  >
                    {game.badge}
                  </span>
                  <Badge variant="speed" icon={<Zap className="w-3 h-3 text-cyan-400" />}>
                    {game.delivery_time}
                  </Badge>
                </div>
                <h1 className="text-xl sm:text-3xl font-black text-white">
                  {locale === 'bn' && game.name_bn ? game.name_bn : game.name}
                </h1>
                <p className="text-xs text-gray-200 mt-1 max-w-xl">
                  {game.description}
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-300 font-bold bg-white/[0.08] px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-xl">
                <ShieldCheck className="w-4 h-4" />
                <span>{t('secureGuaranteed')}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* 2-Column Responsive Layout: Steps on Left, Checkout Box on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Step 1 (Account Info) & Step 2 (Package Selector) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Contextual Account Input */}
            <Card variant="glass" className="p-6 space-y-4 border-white/20">
              <div className="flex items-center gap-2.5 border-b border-white/15 pb-3">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-700 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-rose-600/30">
                  ১
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">{t('step1AccountInfo')}</h3>
                  <p className="text-[11px] text-gray-300">Enter accurate gamer credentials</p>
                </div>
              </div>

              {game.id === 'pubg' ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-200 block mb-1">
                      Player ID / UID *
                    </label>
                    <input
                      type="text"
                      value={formData.uid || ''}
                      onChange={e => setFormData({ ...formData, uid: e.target.value })}
                      placeholder={t('playerIdPlaceholder')}
                      className="w-full py-2.5 px-3.5 rounded-2xl bg-white/[0.06] border border-white/20 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-rose-500/70 backdrop-blur-xl font-mono"
                    />
                  </div>
                </div>
              ) : game.id === 'roblox' ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-200 block mb-1">
                      Roblox Username *
                    </label>
                    <input
                      type="text"
                      value={formData.username || ''}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                      placeholder={t('robloxUsernamePlaceholder')}
                      className="w-full py-2.5 px-3.5 rounded-2xl bg-white/[0.06] border border-white/20 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-rose-500/70 backdrop-blur-xl font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-200 block mb-1">
                      Konami ID / Email *
                    </label>
                    <input
                      type="text"
                      value={formData.email || ''}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder={t('konamiIdPlaceholder')}
                      className="w-full py-2.5 px-3.5 rounded-2xl bg-white/[0.06] border border-white/20 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-rose-500/70 backdrop-blur-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-200 block mb-1">
                      Konami Password *
                    </label>
                    <input
                      type="password"
                      value={formData.password || ''}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder={t('passwordPlaceholder')}
                      className="w-full py-2.5 px-3.5 rounded-2xl bg-white/[0.06] border border-white/20 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-rose-500/70 backdrop-blur-xl"
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Step 2: Package Selector Grid */}
            <PackageSelector
              packages={game.packages}
              selectedPackages={selectedPackages}
              onTogglePackage={togglePackage}
            />

            {/* FAQs Accordion */}
            <Card variant="glass" className="p-6 space-y-3 border-white/20">
              <div className="flex items-center gap-2 border-b border-white/15 pb-2.5 text-sm font-bold text-white">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Frequently Asked Questions</span>
              </div>
              {[
                { q: "How long does top-up delivery take?", a: "Most top-ups are processed in 1 to 10 minutes automatically via our priority queue." },
                { q: "Is it 100% safe for my game account?", a: "Yes, all top-ups are 100% genuine and official. Your account will never receive bans or penalties." },
                { q: "What should I do if I sent the wrong TrxID?", a: "Message our 24/7 WhatsApp customer care with your Order ID and correct transaction details." }
              ].map((faq, idx) => (
                <div key={idx} className="border-b border-white/10 last:border-none pb-2">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between text-left py-1 text-xs font-bold text-gray-200 hover:text-white cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {openFaq === idx && (
                    <p className="text-[11px] text-gray-300 pt-1 leading-relaxed">{faq.a}</p>
                  )}
                </div>
              ))}
            </Card>
          </div>

          {/* Right Column: Step 3 (Payment Box Sticky) */}
          <div className="lg:col-span-1">
            <PaymentBox
              settings={settings}
              subtotal={subtotal}
              appliedCoupon={appliedCoupon}
              onApplyCoupon={handleApplyCoupon}
              onSubmitOrder={handleSubmitOrder}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </main>

      <Footer settings={settings} />

      {/* Digital Receipt Modal */}
      {viewingOrder && settings && (
        <InvoiceModal
          order={viewingOrder}
          settings={settings}
          onClose={() => setViewingOrder(null)}
        />
      )}

      {/* Floating Dynamic Island Toast */}
      <FloatingToast
        toast={toast}
        onClose={dismissToast}
      />
    </div>
  );
}

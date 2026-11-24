'use client';

import React, { useState } from 'react';
import { GameItem, PackageItem, SiteSettings, CouponItem } from '@/lib/types';
import { ShieldAlert, Copy, Check, Truck, Sparkles, Search, CreditCard } from 'lucide-react';

interface TopUpSectionProps {
  game: GameItem;
  settings: SiteSettings;
  coupons: CouponItem[];
  appliedCoupon: CouponItem | null;
  onApplyCoupon: (code: string) => void;
  onShowToast: (title: string, desc: string, icon?: string) => void;
  onOrderPlaced: (order: any) => void;
}

export default function TopUpSection({
  game,
  settings,
  coupons,
  appliedCoupon,
  onApplyCoupon,
  onShowToast,
  onOrderPlaced
}: TopUpSectionProps) {
  // Form State
  const [formData, setFormData] = useState<Record<string, string>>({
    device: 'Android'
  });
  const [selectedPackages, setSelectedPackages] = useState<PackageItem[]>([]);
  const [packageSearch, setPackageSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [lastDigits, setLastDigits] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Toggle package card
  const togglePackage = (pkg: PackageItem) => {
    if (!pkg.stock) {
      onShowToast('স্টক শেষ', 'এই প্যাকেজটি বর্তমানে আউট অফ স্টক আছে!', '⚠️');
      return;
    }
    if (selectedPackages.find(p => p.id === pkg.id)) {
      setSelectedPackages(selectedPackages.filter(p => p.id !== pkg.id));
    } else {
      setSelectedPackages([...selectedPackages, pkg]);
    }
  };

  // Calculate pricing
  const subtotal = selectedPackages.reduce((sum, p) => sum + (p.price || 0), 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount);

  // Copy payment number
  const handleCopyNumber = () => {
    const num = paymentMethod === 'bKash' ? settings.bkashNumber : settings.nagadNumber;
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
    onShowToast('নম্বর কপি হয়েছে!', `${paymentMethod} পার্সোনাল নম্বর (${num}) ক্লিপবোর্ডে কপি করা হয়েছে!`, '📋');
  };

  // Submit Order
  const handleOrderSubmit = async () => {
    if (selectedPackages.length === 0) {
      onShowToast('প্যাকেজ নির্বাচন করুন', 'অনুগ্রহ করে কমপক্ষে একটি প্যাকেজ নির্বাচন করুন!', '⚠️');
      return;
    }

    // Validate required fields
    for (const field of game.custom_fields) {
      if (field.required && !formData[field.id]) {
        onShowToast('তথ্য পূরণ করুন', `'${field.label_bn || field.label}' দিন!`, '⚠️');
        return;
      }
    }

    if (!lastDigits.trim()) {
      onShowToast('পেমেন্ট তথ্য', `আপনার ${paymentMethod} নম্বরের শেষ ৪ ডিজিট বা TrxID দিন!`, '⚠️');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: game.id,
          gameName: game.name,
          packages: selectedPackages.map(p => ({ id: p.id, name: p.name, price: p.price || 0 })),
          totalAmount: grandTotal,
          paymentMethod,
          senderLastDigits: lastDigits,
          customData: formData
        })
      });

      const json = await res.json();
      if (json.success) {
        // Trigger delivery truck animation
        setTimeout(() => {
          setIsSubmitting(false);
          setSelectedPackages([]);
          setLastDigits('');
          onOrderPlaced(json.order);

          // WhatsApp dispatch to Admin
          const pkgList = json.order.packages.map((p: any) => p.name).join(', ');
          const msg = `⚡ *নতুন অর্ডার:* ${json.order.id}\n🎮 *গেম:* ${json.order.gameName}\n📦 *প্যাকেজ:* ${pkgList}\n💰 *মোট টাকা:* ৳${json.order.totalAmount}\n💳 *পেমেন্ট:* ${json.order.paymentMethod} (শেষ ৪ সংখ্যা: ${json.order.senderLastDigits})\n📱 *হোয়াটসঅ্যাপ:* ${formData.whatsapp || 'N/A'}`;
          window.open(`https://wa.me/88${settings.supportPhone}?text=${encodeURIComponent(msg)}`, '_blank');
        }, 1800);
      } else {
        setIsSubmitting(false);
        onShowToast('অর্ডার ব্যর্থ', json.error || 'অর্ডার করতে সমস্যা হয়েছে', '❌');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      onShowToast('ত্রুটি', err.message, '❌');
    }
  };

  const filteredPackages = game.packages.filter(p =>
    !packageSearch ||
    p.name.toLowerCase().includes(packageSearch.toLowerCase()) ||
    (p.price && String(p.price).includes(packageSearch))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 mt-8 space-y-6">
      {/* Active Game Notice */}
      <div className="p-4 rounded-2xl glass-panel border border-red-500/20 bg-red-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={game.poster}
            alt={game.name}
            className="w-12 h-12 rounded-xl object-cover border border-white/10"
            onError={(e: any) => (e.target.src = '/banner.jpg')}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white" style={{ backgroundColor: game.badge_color }}>
                {game.badge}
              </span>
              <h2 className="text-base font-black text-white">{game.name}</h2>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">{game.description}</p>
          </div>
        </div>
        <div className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 flex-shrink-0">
          ⚡ {game.delivery_time} ডেলিভারি গ্যারান্টি
        </div>
      </div>

      {/* STEP 1: Account Information */}
      <div className="p-5 rounded-3xl glass-panel border border-white/10 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="w-6 h-6 rounded-lg bg-red-500 text-white font-extrabold text-xs flex items-center justify-center">
            ১
          </span>
          <h3 className="text-sm font-extrabold text-white">
            অ্যাকাউন্ট তথ্য (Account Info)
          </h3>
        </div>

        {/* Dynamic Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {game.custom_fields.map(field => {
            if (field.type === 'device_selector' && field.options) {
              return (
                <div key={field.id} className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">{field.label_bn || field.label}</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {field.options.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, [field.id]: opt.id })}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          formData[field.id] === opt.id
                            ? 'bg-red-500/15 border-red-500 text-white shadow-md'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-bold">{opt.name}</div>
                        <div className="text-[10px] text-gray-400">{opt.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <div key={field.id} className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">
                  {field.label_bn || field.label} {field.required && <span className="text-red-400">*</span>}
                </label>
                <input
                  type={field.type}
                  value={formData[field.id] || ''}
                  onChange={e => setFormData({ ...formData, [field.id]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 text-white transition-all placeholder:text-gray-500"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 2: Package Selection Grid */}
      <div className="p-5 rounded-3xl glass-panel border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-red-500 text-white font-extrabold text-xs flex items-center justify-center">
              ২
            </span>
            <h3 className="text-sm font-extrabold text-white">
              প্যাকেজ নির্বাচন করুন (Select Packages)
            </h3>
          </div>

          {/* Quick Package Search */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={packageSearch}
              onChange={e => setPackageSearch(e.target.value)}
              placeholder="প্যাকেজ খুঁজুন..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredPackages.map(pkg => {
            const isSelected = Boolean(selectedPackages.find(p => p.id === pkg.id));

            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => togglePackage(pkg)}
                className={`p-3 rounded-2xl border text-left transition-all duration-200 relative group ${
                  isSelected
                    ? 'bg-red-500/20 border-red-500 shadow-lg shadow-red-500/20 scale-102 ring-2 ring-red-500/30'
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8'
                } ${!pkg.stock ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">{pkg.icon || '🪙'}</span>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${pkg.stock ? 'text-emerald-400 bg-emerald-500/15' : 'text-red-400 bg-red-500/15'}`}>
                    {pkg.stock ? 'ইন স্টক' : 'আউট অফ স্টক'}
                  </span>
                </div>

                <div className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                  {pkg.name}
                </div>

                <div className="text-sm font-extrabold text-emerald-400 mt-1">
                  {pkg.price ? `৳${pkg.price}` : '৳***'}
                </div>

                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] shadow-md font-bold">
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 3: Payment Method & Checkout */}
      <div className="p-5 rounded-3xl glass-panel border border-white/10 space-y-5">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="w-6 h-6 rounded-lg bg-red-500 text-white font-extrabold text-xs flex items-center justify-center">
            ৩
          </span>
          <h3 className="text-sm font-extrabold text-white">
            পেমেন্ট মেথড ও চেকআউট (Payment Method)
          </h3>
        </div>

        {/* Payment Methods Tabs */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPaymentMethod('bKash')}
            className={`p-3.5 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              paymentMethod === 'bKash'
                ? 'bg-pink-600 text-white border-pink-500 shadow-lg shadow-pink-600/30'
                : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
            }`}
          >
            <span>বিকাশ (bKash)</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('Nagad')}
            className={`p-3.5 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              paymentMethod === 'Nagad'
                ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-600/30'
                : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
            }`}
          >
            <span>নগদ (Nagad)</span>
          </button>
        </div>

        {/* Payment Account Send Money Instruction Box */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs text-gray-400">
              নিচের নম্বরে <strong>{paymentMethod} Personal (Send Money)</strong> করুন:
            </div>
            <div className="text-base sm:text-lg font-black text-white tracking-widest mt-0.5">
              {paymentMethod === 'bKash' ? settings.bkashNumber : settings.nagadNumber}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyNumber}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all"
          >
            {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedNumber ? 'কপি হয়েছে!' : 'নম্বর কপি করুন'}</span>
          </button>
        </div>

        {/* Sender Last 4 Digits & Coupon Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">
              আপনার {paymentMethod} নম্বরের শেষ ৪ ডিজিট বা TrxID <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={lastDigits}
              onChange={e => setLastDigits(e.target.value)}
              placeholder="e.g. 4821 অথবা TRX12345"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">কুপন / প্রোমো কোড (ঐচ্ছিক)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={e => setCouponInput(e.target.value.toUpperCase())}
                placeholder="যেমন: SONIC10"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white uppercase focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={() => onApplyCoupon(couponInput)}
                className="px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500 border border-red-500/30 text-red-400 hover:text-white font-bold text-xs transition-colors flex-shrink-0"
              >
                প্রয়োগ
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400">
              সিলেক্টেড প্যাকেজ: <strong className="text-white">{selectedPackages.length} টি</strong>
            </div>
            {appliedCoupon && (
              <div className="text-xs text-emerald-400 font-semibold mt-0.5">
                🎉 কুপন ছাড়: ৳{appliedCoupon.discount} ({appliedCoupon.code})
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">সর্বমোট মূল্য:</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">
              ৳{grandTotal}
            </div>
          </div>
        </div>

        {/* Delivery Truck Order Button */}
        <button
          type="button"
          onClick={handleOrderSubmit}
          disabled={isSubmitting}
          className="w-full relative overflow-hidden py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm tracking-wider shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-60"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 animate-bounce text-amber-300" />
              <span>অর্ডার প্রসেস হচ্ছে ও ডেলিভারি শুরু...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-300 group-hover:translate-x-1 transition-transform" />
              <span>অর্ডার সম্পন্ন করতে ক্লিক করুন (৳{grandTotal})</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

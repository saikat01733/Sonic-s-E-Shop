'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import InvoiceModal from '@/components/storefront/InvoiceModal';
import FloatingToast, { ToastMessage } from '@/components/storefront/FloatingToast';
import { GameItem, PackageItem, SiteSettings, CouponItem, OrderItem } from '@/lib/types';
import {
  Zap,
  ShieldCheck,
  Check,
  Copy,
  Truck,
  Sparkles,
  Search,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Star,
  RefreshCw,
  Flame,
  CheckCircle2
} from 'lucide-react';

export default function GameDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [game, setGame] = useState<GameItem | null>(null);
  const [allGames, setAllGames] = useState<GameItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Top-Up Form State
  const [formData, setFormData] = useState<Record<string, string>>({ device: 'Android' });
  const [selectedPackages, setSelectedPackages] = useState<PackageItem[]>([]);
  const [packageSearch, setPackageSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [lastDigits, setLastDigits] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [viewingOrder, setViewingOrder] = useState<OrderItem | null>(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    fetch('/api/site-data')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setAllGames(json.data.games);
          setSettings(json.data.settings);
          setCoupons(json.data.coupons);

          const matched = json.data.games.find(
            (g: GameItem) => g.slug === resolvedParams.slug || g.id === resolvedParams.slug
          );
          if (matched) {
            setGame(matched);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [resolvedParams.slug]);

  const showToast = (title: string, desc: string, icon: string = '✓') => {
    setToast({ id: String(Date.now()), title, desc, icon });
  };

  const togglePackage = (pkg: PackageItem) => {
    if (!pkg.stock) {
      showToast('স্টক শেষ', 'এই প্যাকেজটি বর্তমানে আউট অফ স্টক আছে!', '⚠️');
      return;
    }
    if (selectedPackages.find(p => p.id === pkg.id)) {
      setSelectedPackages(selectedPackages.filter(p => p.id !== pkg.id));
    } else {
      setSelectedPackages([...selectedPackages, pkg]);
    }
  };

  const subtotal = selectedPackages.reduce((sum, p) => sum + (p.price || 0), 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount);

  const handleCopyNumber = () => {
    if (!settings) return;
    const num = paymentMethod === 'bKash' ? settings.bkashNumber : settings.nagadNumber;
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
    showToast('নম্বর কপি হয়েছে!', `${paymentMethod} নম্বর (${num}) ক্লিপবোর্ডে কপি করা হয়েছে!`, '📋');
  };

  const handleApplyCoupon = (code: string) => {
    const norm = (code || '').trim().toUpperCase();
    const match = coupons.find(c => c.code.toUpperCase() === norm && c.active);
    if (match) {
      setAppliedCoupon(match);
      showToast('কুপন সক্রিয় হয়েছে!', `🎉 ${match.code} কোড প্রয়োগে ৳${match.discount} ছাড় যোগ হয়েছে!`, '🎟️');
    } else {
      showToast('ভুল কুপন কোড', 'এই কুপনটি সঠিক নয় বা মেয়াদ শেষ!', '⚠️');
    }
  };

  const handleOrderSubmit = async () => {
    if (!game || !settings) return;

    if (selectedPackages.length === 0) {
      showToast('প্যাকেজ নির্বাচন করুন', 'অনুগ্রহ করে কমপক্ষে একটি প্যাকেজ নির্বাচন করুন!', '⚠️');
      return;
    }

    for (const field of game.custom_fields) {
      if (field.required && !formData[field.id]) {
        showToast('তথ্য দিন', `'${field.label_bn || field.label}' পূরণ করুন!`, '⚠️');
        return;
      }
    }

    if (!lastDigits.trim()) {
      showToast('পেমেন্ট তথ্য', `আপনার ${paymentMethod} নম্বরের শেষ ৪ ডিজিট বা TrxID দিন!`, '⚠️');
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
        setTimeout(() => {
          setIsSubmitting(false);
          setSelectedPackages([]);
          setLastDigits('');
          setViewingOrder(json.order);

          // WhatsApp dispatch
          const pkgList = json.order.packages.map((p: any) => p.name).join(', ');
          const msg = `⚡ *নতুন অর্ডার:* ${json.order.id}\n🎮 *গেম:* ${json.order.gameName}\n📦 *প্যাকেজ:* ${pkgList}\n💰 *মোট টাকা:* ৳${json.order.totalAmount}\n💳 *পেমেন্ট:* ${json.order.paymentMethod} (শেষ ৪ সংখ্যা: ${json.order.senderLastDigits})\n📱 *হোয়াটসঅ্যাপ:* ${formData.whatsapp || 'N/A'}`;
          window.open(`https://wa.me/88${settings.supportPhone}?text=${encodeURIComponent(msg)}`, '_blank');
        }, 1800);
      } else {
        setIsSubmitting(false);
        showToast('অর্ডার ব্যর্থ', json.error, '❌');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      showToast('ত্রুটি', err.message, '❌');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-white text-xs">
        <RefreshCw className="w-6 h-6 animate-spin text-red-500 mr-2" />
        <span>গেমের বিবরণ লোড হচ্ছে...</span>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar settings={settings || undefined} games={allGames} />
        <div className="max-w-md mx-auto p-8 liquid-glass text-center my-20">
          <h2 className="text-base font-bold text-white mb-2">গেমটি পাওয়া যায়নি!</h2>
          <Link href="/games" className="text-xs text-red-400 font-bold hover:underline">
            ← সকল গেম ক্যাটালগে ফিরুন
          </Link>
        </div>
        <Footer settings={settings || undefined} />
      </div>
    );
  }

  const faqs = [
    {
      q: 'টপ-আপ পেতে কতক্ষণ সময় লাগে?',
      a: `অর্ডার কনফার্ম করার ১ থেকে ${game.delivery_time} এর মধ্যে আপনার অ্যাকাউন্টে স্বয়ংক্রিয়ভাবে ডেলিভারি হয়ে যাবে।`
    },
    {
      q: 'পাসওয়ার্ড দেওয়া কি নিরাপদ?',
      a: game.product_type === 'login_purchase'
        ? 'হ্যাঁ, এটি ১০০% অফিশিয়াল Konami সার্ভার দিয়ে টপ-আপ করা হয়। টপ-আপের পর আপনি নিরাপদে পাসওয়ার্ড পরিবর্তন করে নিতে পারবেন।'
        : 'এই গেমে কোনো পাসওয়ার্ডের প্রয়োজন নেই! শুধুমাত্র Player ID (UID) দিয়ে টপ-আপ সম্পন্ন হয়।'
    },
    {
      q: 'পেমেন্ট করার পর কী করতে হবে?',
      a: 'পেমেন্ট সম্পন্ন করার পর স্ক্রিনে আপনার অর্ডার রসিদ (Invoice) পাবেন এবং আমাদের হোয়াটসঅ্যাপে স্বয়ংক্রিয় মেসেজ চলে যাবে।'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar settings={settings || undefined} games={allGames} />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 mt-6 w-full space-y-8">
        {/* Breadcrumb Back Link */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">হোম</Link>
          <span>/</span>
          <Link href="/games" className="hover:text-white transition-colors">সকল গেম</Link>
          <span>/</span>
          <span className="text-white font-bold">{game.name}</span>
        </div>

        {/* Cinematic Liquid Glass Game Header */}
        <div className="liquid-glass overflow-hidden relative border border-white/15">
          <div className="relative aspect-[21/9] sm:aspect-[24/7] w-full overflow-hidden bg-black/70">
            <img
              src={game.poster}
              alt={game.name}
              className="w-full h-full object-cover"
              onError={(e: any) => (e.target.src = '/banner.jpg')}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080a0f] via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#080a0f]/90 via-transparent to-[#080a0f]/90" />

            {/* Game Badge & Details Overlay */}
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-white shadow-lg"
                    style={{ backgroundColor: game.badge_color }}
                  >
                    {game.badge}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-amber-300 font-bold text-[10px] flex items-center gap-1 border border-white/15">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>{game.delivery_time} ডেলিভারি</span>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-wide">
                  {game.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 max-w-xl mt-1 leading-relaxed">
                  {game.description}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/15 px-3.5 py-2 rounded-2xl border border-emerald-500/30 flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
                <span>{game.trust_tag}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Step Liquid Glass Top-Up Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Steps 1 & 2) */}
          <div className="lg:col-span-2 space-y-6">
            {/* STEP 1: Account Information */}
            <div className="liquid-glass p-6 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
                <div className="w-7 h-7 rounded-xl bg-red-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-red-600/30">
                  ১
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">অ্যাকাউন্ট তথ্য (Account Details)</h3>
                  <p className="text-[11px] text-gray-400">টপ-আপ রিসিভ করার জন্য আপনার সঠিক তথ্য প্রদান করুন</p>
                </div>
              </div>

              {/* Dynamic Input Fields */}
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
                                  ? 'bg-red-500/20 border-red-500 text-white shadow-lg shadow-red-500/25 ring-2 ring-red-500/30'
                                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                              }`}
                            >
                              <div className="text-xs font-extrabold">{opt.name}</div>
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
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-red-500/60 placeholder:text-gray-500 transition-all"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: Package Selection Grid */}
            <div className="liquid-glass p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-red-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-red-600/30">
                    ২
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">প্যাকেজ নির্বাচন করুন (Select Packages)</h3>
                    <p className="text-[11px] text-gray-400">আপনার প্রয়োজনীয় পরিমাণ কয়েন/ইউসি নির্বাচন করুন</p>
                  </div>
                </div>

                {/* Package Quick Search */}
                <div className="relative w-full sm:w-56">
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

              {/* Package Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {game.packages
                  .filter(p => !packageSearch || p.name.toLowerCase().includes(packageSearch.toLowerCase()) || (p.price && String(p.price).includes(packageSearch)))
                  .map(pkg => {
                    const isSelected = Boolean(selectedPackages.find(p => p.id === pkg.id));

                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => togglePackage(pkg)}
                        className={`p-3.5 rounded-2xl border text-left transition-all duration-200 relative group ${
                          isSelected
                            ? 'bg-red-500/25 border-red-500 shadow-xl shadow-red-500/25 ring-2 ring-red-500/40 scale-102'
                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                        } ${!pkg.stock ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xl">{pkg.icon || '🪙'}</span>
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                            pkg.stock ? 'text-emerald-400 bg-emerald-500/20' : 'text-red-400 bg-red-500/20'
                          }`}>
                            {pkg.stock ? 'ইন স্টক' : 'আউট'}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                          {pkg.name}
                        </div>

                        <div className="text-sm font-black text-emerald-400 mt-1">
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
          </div>

          {/* Right Column (STEP 3: Payment Checkout Box) */}
          <div className="space-y-6">
            <div className="liquid-glass p-6 space-y-5 sticky top-20 border border-white/15">
              <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
                <div className="w-7 h-7 rounded-xl bg-red-600 text-white font-black text-xs flex items-center justify-center shadow-md">
                  ৩
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">পেমেন্ট মেথড ও চেকআউট</h3>
                  <p className="text-[11px] text-gray-400">বিকাশ বা নগদ সেন্ড মানি করুন</p>
                </div>
              </div>

              {/* Payment Method Switcher */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bKash')}
                  className={`p-3 rounded-2xl border font-bold text-xs flex items-center justify-center transition-all ${
                    paymentMethod === 'bKash'
                      ? 'bg-pink-600 text-white border-pink-500 shadow-lg shadow-pink-600/30'
                      : 'bg-white/5 border-white/10 text-gray-300'
                  }`}
                >
                  বিকাশ (bKash)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Nagad')}
                  className={`p-3 rounded-2xl border font-bold text-xs flex items-center justify-center transition-all ${
                    paymentMethod === 'Nagad'
                      ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-600/30'
                      : 'bg-white/5 border-white/10 text-gray-300'
                  }`}
                >
                  নগদ (Nagad)
                </button>
              </div>

              {/* Send Money Number Box */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="text-[11px] text-gray-400">
                  নিচের নম্বরে <strong>{paymentMethod} Personal (Send Money)</strong> করুন:
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-white tracking-widest font-mono">
                    {paymentMethod === 'bKash' ? settings.bkashNumber : settings.nagadNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1 transition-all"
                  >
                    {copiedNumber ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedNumber ? 'কপি হয়েছে' : 'কপি'}</span>
                  </button>
                </div>
              </div>

              {/* Sender Last 4 Digits Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">
                  আপনার {paymentMethod} শেষ ৪ ডিজিট / TrxID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={lastDigits}
                  onChange={e => setLastDigits(e.target.value)}
                  placeholder="e.g. 4821 অথবা TRX98271"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              {/* Promo Coupon Code */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">কুপন কোড (ঐচ্ছিক)</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="যেমন: SONIC10"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white uppercase font-mono focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon(couponCode)}
                    className="px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white font-bold text-xs transition-colors flex-shrink-0"
                  >
                    প্রয়োগ
                  </button>
                </div>
              </div>

              {/* Price Calculation Box */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>সিলেক্টেড প্যাকেজ:</span>
                  <span className="font-bold text-white">{selectedPackages.length} টি</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>কুপন ছাড় ({appliedCoupon.code}):</span>
                    <span>-৳{appliedCoupon.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-white/10">
                  <span>সর্বমোট মূল্য:</span>
                  <span className="text-emerald-400 text-base">৳{grandTotal}</span>
                </div>
              </div>

              {/* Delivery Truck Order Button */}
              <button
                type="button"
                onClick={handleOrderSubmit}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs tracking-wider shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-60"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 animate-bounce text-amber-300" />
                    <span>অর্ডার প্রসেস হচ্ছে...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
                    <span>অর্ডার কনফার্ম করুন (৳{grandTotal})</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Security Rules & FAQs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rules Card */}
          <div className="liquid-glass p-6 space-y-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              টপ-আপের নিয়ম ও নিরাপত্তা নির্দেশিকা
            </h3>
            <ul className="space-y-2 text-xs text-gray-300">
              {game.rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* FAQs Accordion */}
          <div className="liquid-glass p-6 space-y-3">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              সাধারণ প্রশ্নোত্তর (FAQ)
            </h3>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-white/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-3 text-left text-xs font-bold text-white flex items-center justify-between hover:bg-white/5"
                  >
                    <span>{faq.q}</span>
                    {openFaq === i ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {openFaq === i && (
                    <div className="p-3 pt-0 text-xs text-gray-400 bg-white/2">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer settings={settings || undefined} />

      {/* Digital Receipt Modal */}
      <InvoiceModal
        order={viewingOrder}
        settings={settings}
        onClose={() => setViewingOrder(null)}
      />

      {/* Floating Toast Notification */}
      <FloatingToast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

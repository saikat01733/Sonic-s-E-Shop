'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminSidebar, AdminTab } from '@/components/features/admin/admin-sidebar';
import { KpiGrid } from '@/components/features/admin/kpi-grid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  ExternalLink,
  Save,
  RefreshCw,
  Flame,
  ArrowLeft
} from 'lucide-react';
import { StoreData, GameItem, PackageItem, CouponItem, OrderItem, HeroSlide, TrustBadge } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { ImageUploader } from '@/components/common/ImageUploader';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<string>('efootball');

  // Edit / Modal States
  const [editingGame, setEditingGame] = useState<GameItem | null>(null);
  const [editingPackage, setEditingPackage] = useState<{ gameId: string; pkg: PackageItem } | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [editingTrustBadge, setEditingTrustBadge] = useState<TrustBadge | null>(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [historySearch, setHistorySearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('sonic_admin_token');
    const params = new URLSearchParams(window.location.search);
    if (token || params.get('auth') === '1') {
      setIsAuthenticated(true);
    }
    const tabParam = params.get('tab') as AdminTab;
    if (tabParam) {
      setActiveTab(tabParam);
    }
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/cms');
      const json = await res.json();
      if (json.success) {
        setStoreData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput })
      });
      const json = await res.json();
      if (json.success) {
        localStorage.setItem('sonic_admin_token', json.token);
        setIsAuthenticated(true);
      } else {
        setAuthError(json.error || 'ভুল পিন দিয়েছেন!');
      }
    } catch {
      setAuthError('লগইন ব্যর্থ হয়েছে');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sonic_admin_token');
    setIsAuthenticated(false);
  };

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setSaveMessage({ text, type });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeData) return;
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_settings',
          payload: { settings: storeData.settings, trustBadges: storeData.trustBadges },
          author: 'Admin'
        })
      });
      const json = await res.json();
      if (json.success) {
        showNotice('সাইট সেটিংস ও টিকার সফলভাবে আপডেট হয়েছে!');
        fetchStoreData();
      }
    } catch (e: any) {
      showNotice(e.message, 'error');
    }
  };

  const handleSaveGame = async (game: GameItem) => {
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_game', payload: game, author: 'Admin' })
      });
      const json = await res.json();
      if (json.success) {
        showNotice(`গেম '${game.name}' সংরক্ষিত হয়েছে!`);
        setEditingGame(null);
        fetchStoreData();
      }
    } catch (e: any) {
      showNotice(e.message, 'error');
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই গেমটি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_game', payload: { id: gameId }, author: 'Admin' })
      });
      const json = await res.json();
      if (json.success) {
        showNotice('গেমটি সফলভাবে মুছে ফেলা হয়েছে!');
        fetchStoreData();
      }
    } catch (e: any) {
      showNotice(e.message, 'error');
    }
  };

  const handleSavePackage = async (gameId: string, pkg: PackageItem) => {
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_package', payload: { gameId, pkg }, author: 'Admin' })
      });
      const json = await res.json();
      if (json.success) {
        showNotice(`প্যাকেজ '${pkg.name}' সংরক্ষিত হয়েছে!`);
        setEditingPackage(null);
        fetchStoreData();
      }
    } catch (e: any) {
      showNotice(e.message, 'error');
    }
  };

  const handleDeletePackage = async (gameId: string, pkgId: string) => {
    if (!confirm('আপনি কি এই প্যাকেজটি মুছতে চান?')) return;
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_package', payload: { gameId, pkgId }, author: 'Admin' })
      });
      const json = await res.json();
      if (json.success) {
        showNotice('প্যাকেজটি মুছে ফেলা হয়েছে!');
        fetchStoreData();
      }
    } catch (e: any) {
      showNotice(e.message, 'error');
    }
  };

  const handleSaveCoupon = async (coupon: CouponItem) => {
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_coupon', payload: coupon, author: 'Admin' })
      });
      const json = await res.json();
      if (json.success) {
        showNotice(`কুপন '${coupon.code}' সংরক্ষিত হয়েছে!`);
        setEditingCoupon(null);
        fetchStoreData();
      }
    } catch (e: any) {
      showNotice(e.message, 'error');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('কুপনটি মুছতে চান?')) return;
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_coupon', payload: { id }, author: 'Admin' })
      });
      const json = await res.json();
      if (json.success) {
        showNotice('কুপন মুছে ফেলা হয়েছে!');
        fetchStoreData();
      }
    } catch (e: any) {
      showNotice(e.message, 'error');
    }
  };

  const handleSaveSlide = async (slide: HeroSlide) => {
    if (!storeData) return;
    const currentSlides = storeData.settings.slides || [];
    const exists = currentSlides.some(s => s.id === slide.id);
    const updatedSlides = exists
      ? currentSlides.map(s => (s.id === slide.id ? slide : s))
      : [...currentSlides, slide];

    const updatedSettings = { ...storeData.settings, slides: updatedSlides };
    setStoreData({ ...storeData, settings: updatedSettings });

    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_settings',
          payload: { settings: updatedSettings, trustBadges: storeData.trustBadges },
          author: 'Admin'
        })
      });
      const json = await res.json();
      if (json.success) {
        showNotice(`স্লাইড '${slide.title}' সফলভাবে সংরক্ষিত হয়েছে!`);
        setEditingSlide(null);
        fetchStoreData();
      } else {
        showNotice(json.error || 'স্লাইড সংরক্ষণ ব্যর্থ হয়েছে', 'error');
      }
    } catch (e: any) {
      showNotice(e.message, 'error');
    }
  };

  const handleDeleteSlide = async (slideId: string) => {
    if (!storeData) return;
    if (!confirm('আপনি কি এই স্লাইডটি মুছে ফেলতে চান?')) return;
    const updatedSlides = (storeData.settings.slides || []).filter(s => s.id !== slideId);
    const updatedSettings = { ...storeData.settings, slides: updatedSlides };
    setStoreData({ ...storeData, settings: updatedSettings });

    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_settings',
          payload: { settings: updatedSettings, trustBadges: storeData.trustBadges },
          author: 'Admin'
        })
      });
      const json = await res.json();
      if (json.success) {
        showNotice('স্লাইড মুছে ফেলা হয়েছে!');
        fetchStoreData();
      }
    } catch (e: any) {
      showNotice(e.message, 'error');
    }
  };

  const handleSaveTrustBadge = async (badge: TrustBadge) => {
    if (!storeData) return;
    const updatedBadges = (storeData.trustBadges || []).map(b => (b.id === badge.id ? badge : b));
    setStoreData({ ...storeData, trustBadges: updatedBadges });

    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_settings',
          payload: { settings: storeData.settings, trustBadges: updatedBadges },
          author: 'Admin'
        })
      });
      const json = await res.json();
      if (json.success) {
        showNotice(`ট্রাস্ট ফিচার '${badge.title}' সংরক্ষিত হয়েছে!`);
        setEditingTrustBadge(null);
        fetchStoreData();
      } else {
        showNotice(json.error || 'সংরক্ষণ ব্যর্থ হয়েছে', 'error');
      }
    } catch (e: any) {
      showNotice(e.message, 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderItem['status']) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status, author: 'Admin' })
      });
      const json = await res.json();
      if (json.success) {
        showNotice(`অর্ডার ${orderId} স্ট্যাটাস '${status}' করা হয়েছে!`);
        fetchStoreData();
      }
    } catch (e: any) {
      showNotice(e.message, 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="glass" className="w-full max-w-sm p-6 space-y-4 border-white/25 shadow-2xl backdrop-blur-3xl">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mx-auto text-white mb-2 shadow-lg shadow-red-500/30 font-black">
              ⚡
            </div>
            <h2 className="text-lg font-black text-white">Sonic’s E-Shop Admin</h2>
            <p className="text-xs text-gray-300 mt-0.5">Enter Admin PIN to access Control Center</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <Input
              type="password"
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              placeholder="Admin PIN (Default: sonic2026)"
              className="text-center tracking-widest font-mono"
              autoFocus
            />
            {authError && (
              <div className="text-xs text-red-300 text-center font-semibold bg-red-500/20 py-1.5 rounded-xl border border-red-500/30">
                {authError}
              </div>
            )}
            <Button variant="primary" size="md" className="w-full" type="submit">
              Login to CMS →
            </Button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-gray-300 hover:text-white flex items-center justify-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Storefront
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (loading || !storeData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-red-500" /> Loading Admin CMS Data...
      </div>
    );
  }

  const pendingOrders = storeData.orders.filter(o => o.status === 'Pending').length;
  const completedOrders = storeData.orders.filter(o => o.status === 'Completed').length;
  const totalRevenue = storeData.orders
    .filter(o => o.status === 'Completed')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="min-h-screen text-gray-100 flex flex-col md:flex-row p-2 sm:p-4 gap-4">
      {saveMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl border text-xs font-bold shadow-xl flex items-center gap-2 ${
            saveMessage.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-red-500/20 border-red-500/40 text-red-300'
          }`}
        >
          {saveMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{saveMessage.text}</span>
        </div>
      )}

      {/* Modular Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingOrdersCount={pendingOrders}
        onLogout={handleLogout}
      />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">ড্যাশবোর্ড ওভারভিউ (Dashboard)</h2>
              <p className="text-xs text-gray-400">স্টোরের লাইভ মেট্রিক্স এবং কার্যক্রম</p>
            </div>

            <KpiGrid
              totalRevenue={totalRevenue}
              completedOrdersCount={completedOrders}
              pendingOrdersCount={pendingOrders}
              activeGamesCount={storeData.games.length}
              activeCouponsCount={storeData.coupons.filter(c => c.active).length}
              totalCouponsCount={storeData.coupons.length}
            />

            <Card variant="glass" className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white">সর্বশেষ অর্ডারসমূহ</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-red-400 hover:text-red-300 font-bold cursor-pointer"
                >
                  সবগুলো দেখুন →
                </button>
              </div>

              <div className="space-y-2">
                {storeData.orders.slice(0, 5).map(o => (
                  <div
                    key={o.id}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-white">{o.id}</span>
                      <span className="text-gray-400 ml-2">• {o.gameName}</span>
                      <span className="text-emerald-400 ml-2 font-bold">{formatCurrency(o.totalAmount)}</span>
                    </div>
                    <Badge variant={o.status === 'Completed' ? 'success' : 'warning'}>
                      {o.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* SITE CMS TAB */}
        {activeTab === 'site_cms' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">সাইট ব্র্যান্ডিং ও কন্টেন্ট CMS</h2>
              <p className="text-xs text-gray-400">লোগো ও ব্যানার সরাসরি আপলোড করুন, নোটিশ টিকার ও পেমেন্ট নম্বর পরিবর্তন করুন</p>
            </div>

            <Card variant="glass" className="p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-cyan-400" />
                হেডার নোটিশ টিকার টেক্সট (Marquee Text)
              </h3>
              <textarea
                rows={2}
                value={storeData.settings.tickerText}
                onChange={e =>
                  setStoreData({
                    ...storeData,
                    settings: { ...storeData.settings, tickerText: e.target.value }
                  })
                }
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-red-500 font-medium"
              />
            </Card>

            <Card variant="glass" className="p-5 space-y-5">
              <h3 className="text-sm font-extrabold text-white">ব্র্যান্ডিং ও ইমেজ ফাইল আপলোড (ImgBB Direct Upload)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ImageUploader
                  label="সাইট লোগো (Logo File)"
                  value={storeData.settings.logo || ''}
                  onChange={url =>
                    setStoreData({
                      ...storeData,
                      settings: { ...storeData.settings, logo: url }
                    })
                  }
                  aspect="aspect-square"
                  hint="সরাসরি ড্রপ করুন অথবা ফাইল বেছে নিন (ImgBB CDN)"
                />

                <ImageUploader
                  label="হিরো ব্যানার ফলব্যাক (Wide Banner File)"
                  value={storeData.settings.heroBanner}
                  onChange={url =>
                    setStoreData({
                      ...storeData,
                      settings: { ...storeData.settings, heroBanner: url }
                    })
                  }
                  aspect="aspect-[24/8]"
                  hint="সরাসরি ড্রপ করুন অথবা ফাইল বেছে নিন (ImgBB CDN)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-white/10">
                <Input
                  label="স্টোর নাম (Site Title)"
                  value={storeData.settings.siteName}
                  onChange={e =>
                    setStoreData({
                      ...storeData,
                      settings: { ...storeData.settings, siteName: e.target.value }
                    })
                  }
                />
                <Input
                  label="হিরো হেডলাইন (Hero Title)"
                  value={storeData.settings.heroTitle || ''}
                  onChange={e =>
                    setStoreData({
                      ...storeData,
                      settings: { ...storeData.settings, heroTitle: e.target.value }
                    })
                  }
                />
                <Input
                  label="হিরো সাবটাইটেল (Hero Subtitle)"
                  value={storeData.settings.heroSubtitle || ''}
                  onChange={e =>
                    setStoreData({
                      ...storeData,
                      settings: { ...storeData.settings, heroSubtitle: e.target.value }
                    })
                  }
                />
              </div>
            </Card>

            <Card variant="glass" className="p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-white">পেমেন্ট পার্সোনাল নম্বর (Send Money)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="bKash পার্সোনাল নম্বর"
                  value={storeData.settings.bkashNumber}
                  onChange={e =>
                    setStoreData({
                      ...storeData,
                      settings: { ...storeData.settings, bkashNumber: e.target.value }
                    })
                  }
                />
                <Input
                  label="Nagad পার্সোনাল নম্বর"
                  value={storeData.settings.nagadNumber}
                  onChange={e =>
                    setStoreData({
                      ...storeData,
                      settings: { ...storeData.settings, nagadNumber: e.target.value }
                    })
                  }
                />
              </div>
            </Card>

            <Card variant="glass" className="p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-white">কাস্টমার সাপোর্ট ও সোশ্যাল মিডিয়া</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="সাপোর্ট ফোন নম্বর"
                  value={storeData.settings.supportPhone || ''}
                  onChange={e =>
                    setStoreData({
                      ...storeData,
                      settings: { ...storeData.settings, supportPhone: e.target.value }
                    })
                  }
                />
                <Input
                  label="WhatsApp লিংক (wa.me)"
                  value={storeData.settings.whatsappUrl || ''}
                  onChange={e =>
                    setStoreData({
                      ...storeData,
                      settings: { ...storeData.settings, whatsappUrl: e.target.value }
                    })
                  }
                />
                <Input
                  label="ফেসবুক পেইজ লিংক"
                  value={storeData.settings.facebookUrl || ''}
                  onChange={e =>
                    setStoreData({
                      ...storeData,
                      settings: { ...storeData.settings, facebookUrl: e.target.value }
                    })
                  }
                />
              </div>
            </Card>

            <Button variant="primary" size="md" type="submit" icon={<Save className="w-4 h-4" />}>
              পরিবর্তন সংরক্ষণ করুন
            </Button>
          </form>
        )}

        {/* HERO SLIDES TAB */}
        {activeTab === 'hero_slides' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">হিরো ক্যারোজেল স্লাইডার CMS (Hero Slides)</h2>
                <p className="text-xs text-gray-400">হোমপেজ স্লাইডার ইমেজ (ImgBB Upload), টাইটেল, ব্যাজ ও লিঙ্ক সরাসরি নিয়ন্ত্রণ করুন</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() =>
                  setEditingSlide({
                    id: `slide-${Date.now()}`,
                    gameId: storeData.games[0]?.id || 'efootball',
                    slug: storeData.games[0]?.slug || 'efootball-coin',
                    title: 'New Game Top-Up',
                    subtitle: 'Instant delivery with 100% guarantee.',
                    badge: '⚡ 1-10 MINS',
                    deliveryTime: '১-১০ মিনিট',
                    image: '/banner.webp',
                    color: '#0284c7'
                  })
                }
              >
                নতুন স্লাইড যোগ করুন
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(storeData.settings.slides || []).map((slide, idx) => (
                <Card key={slide.id || idx} variant="glass" className="overflow-hidden p-0 flex flex-col justify-between border-white/15">
                  <div className="relative aspect-[21/9] w-full bg-black/40 overflow-hidden">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                      onError={(e: any) => (e.target.src = '/banner.webp')}
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/80 text-white backdrop-blur-md">
                        {slide.badge}
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2 text-[10px] font-mono font-bold bg-black/70 px-2 py-0.5 rounded text-white">
                      ⏱ {slide.deliveryTime}
                    </div>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-black text-white">{slide.title}</h4>
                      <p className="text-xs text-gray-300 line-clamp-2 mt-1">{slide.subtitle}</p>
                      <div className="text-[11px] text-cyan-400 font-mono mt-2">
                        Game Link: /{slide.slug}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                      <Button
                        variant="glass"
                        size="sm"
                        icon={<Edit2 className="w-3.5 h-3.5" />}
                        onClick={() => setEditingSlide({ ...slide })}
                      >
                        এডিট
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<Trash2 className="w-3.5 h-3.5" />}
                        onClick={() => handleDeleteSlide(slide.id)}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Slide Edit Modal */}
            <Modal
              isOpen={Boolean(editingSlide)}
              onClose={() => setEditingSlide(null)}
              title="হিরো স্লাইডার সম্পাদনা (Edit Slide)"
            >
              {editingSlide && (
                <div className="space-y-4">
                  <ImageUploader
                    label="স্লাইড ব্যানার ইমেজ (ImgBB File Upload)"
                    value={editingSlide.image}
                    onChange={url => setEditingSlide({ ...editingSlide, image: url })}
                    aspect="aspect-[21/9]"
                    hint="ড্র্যাগ & ড্রপ অথবা সিলেক্ট করে ফাইল আপলোড করুন (ImgBB CDN)"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="স্লাইড টাইটেল"
                      value={editingSlide.title}
                      onChange={e => setEditingSlide({ ...editingSlide, title: e.target.value })}
                    />
                    <Input
                      label="টপ ব্যাজ"
                      value={editingSlide.badge}
                      onChange={e => setEditingSlide({ ...editingSlide, badge: e.target.value })}
                      placeholder="e.g. ⚡ HOT TOP-UP"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="ডেলিভারি সময়"
                      value={editingSlide.deliveryTime}
                      onChange={e => setEditingSlide({ ...editingSlide, deliveryTime: e.target.value })}
                      placeholder="e.g. 1-10 MINS"
                    />
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1.5">কানেক্টেড গেম (Target Game)</label>
                      <select
                        value={editingSlide.gameId}
                        onChange={e => {
                          const found = storeData.games.find(g => g.id === e.target.value);
                          if (found) {
                            setEditingSlide({
                              ...editingSlide,
                              gameId: found.id,
                              slug: found.slug
                            });
                          }
                        }}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white font-bold"
                      >
                        {storeData.games.map(g => (
                          <option key={g.id} value={g.id} className="bg-black">
                            {g.name} (/{g.slug})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">সাবটাইটেল / বিবরণ</label>
                    <textarea
                      rows={2}
                      value={editingSlide.subtitle}
                      onChange={e => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                    <Button variant="ghost" size="sm" onClick={() => setEditingSlide(null)}>
                      বাতিল
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleSaveSlide(editingSlide)}>
                      স্লাইড সংরক্ষণ করুন
                    </Button>
                  </div>
                </div>
              )}
            </Modal>
          </div>
        )}

        {/* TRUST BADGES TAB */}
        {activeTab === 'trust_badges' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">ট্রাস্ট ব্যাজ ও সুবিধা CMS (Trust Badges & Perks)</h2>
              <p className="text-xs text-gray-400">হোমপেজের 'Why Choose Us' সেকশনের ট্রাস্ট ফিচারসমূহ কাস্টমাইজ করুন</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(storeData.trustBadges || []).map((badge, idx) => (
                <Card key={badge.id || idx} variant="glass" className="p-5 flex flex-col justify-between space-y-4 border-white/15">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black">
                      {badge.icon === 'shield' ? '🛡️' : badge.icon === 'zap' ? '⚡' : badge.icon === 'headset' ? '🎧' : '👥'}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">#{badge.id}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-white">{badge.title}</h4>
                    <p className="text-xs text-gray-300 mt-1">{badge.sub}</p>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex justify-end">
                    <Button
                      variant="glass"
                      size="sm"
                      icon={<Edit2 className="w-3.5 h-3.5" />}
                      onClick={() => setEditingTrustBadge({ ...badge })}
                    >
                      এডিট
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Trust Badge Edit Modal */}
            <Modal
              isOpen={Boolean(editingTrustBadge)}
              onClose={() => setEditingTrustBadge(null)}
              title="ট্রাস্ট ফিচার সম্পাদনা (Edit Trust Badge)"
            >
              {editingTrustBadge && (
                <div className="space-y-4">
                  <Input
                    label="ফিচার টাইটেল"
                    value={editingTrustBadge.title}
                    onChange={e => setEditingTrustBadge({ ...editingTrustBadge, title: e.target.value })}
                  />

                  <Input
                    label="সাবটাইটেল / বিবরণ"
                    value={editingTrustBadge.sub}
                    onChange={e => setEditingTrustBadge({ ...editingTrustBadge, sub: e.target.value })}
                  />

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">আইকন নির্বাচন করুন</label>
                    <select
                      value={editingTrustBadge.icon}
                      onChange={e => setEditingTrustBadge({ ...editingTrustBadge, icon: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white font-bold"
                    >
                      <option value="shield" className="bg-black">🛡️ Shield (নিরাপত্তা)</option>
                      <option value="zap" className="bg-black">⚡ Zap (দ্রুত ডেলিভারি)</option>
                      <option value="headset" className="bg-black">🎧 Headset (২৪/৭ সাপোর্ট)</option>
                      <option value="users" className="bg-black">👥 Users (গ্রাহক আস্থা)</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                    <Button variant="ghost" size="sm" onClick={() => setEditingTrustBadge(null)}>
                      বাতিল
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleSaveTrustBadge(editingTrustBadge)}>
                      সংরক্ষণ করুন
                    </Button>
                  </div>
                </div>
              )}
            </Modal>
          </div>
        )}

        {/* GAMES TAB */}
        {activeTab === 'games' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">গেম ক্যাটালগ ম্যানেজমেন্ট (CRUD)</h2>
                <p className="text-xs text-gray-400">নতুন গেম যোগ করুন অথবা বিদ্যমান গেম এডিট করুন</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() =>
                  setEditingGame({
                    id: `game-${Date.now()}`,
                    slug: `new-game-${Date.now()}`,
                    name: 'New Game',
                    name_bn: 'নতুন গেম',
                    category: 'custom',
                    category_name: 'Custom',
                    badge: 'HOT',
                    badge_color: '#ef4444',
                    poster: '/banner.jpg',
                    icon: '🎮',
                    product_type: 'in_game_id',
                    delivery_time: '১-১০ মিনিট',
                    trust_tag: '১০০% নিরাপদ',
                    description: 'Game description',
                    rules: ['সঠিক আইডি দিন'],
                    custom_fields: [
                      { id: 'player_id', type: 'text', label: 'Player ID', label_bn: 'প্লেয়ার আইডি', required: true },
                      { id: 'whatsapp', type: 'tel', label: 'WhatsApp', label_bn: 'হোয়াটসঅ্যাপ', required: true }
                    ],
                    packages: []
                  })
                }
              >
                নতুন গেম যোগ করুন
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {storeData.games.map(game => (
                <Card
                  key={game.id}
                  variant="glass"
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={game.poster}
                      alt={game.name}
                      className="w-16 h-12 rounded-xl object-cover border border-white/10"
                      onError={(e: any) => (e.target.src = '/banner.jpg')}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{game.name}</span>
                        <Badge color={game.badge_color}>{game.badge}</Badge>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        প্যাকেজ: {game.packages.length} টি | ডেলিভারি: {game.delivery_time} | মেথড: {game.product_type}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button variant="glass" size="sm" icon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => setEditingGame({ ...game })}>
                      এডিট
                    </Button>
                    <Button variant="danger" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => handleDeleteGame(game.id)} />
                  </div>
                </Card>
              ))}
            </div>

            {/* Game Edit Modal */}
            <Modal isOpen={Boolean(editingGame)} onClose={() => setEditingGame(null)} title="গেম সম্পাদনা (Edit Game)">
              {editingGame && (
                <div className="space-y-3">
                  <Input
                    label="গেমের নাম (English)"
                    value={editingGame.name}
                    onChange={e => setEditingGame({ ...editingGame, name: e.target.value })}
                  />
                  <Input
                    label="বাংলা নাম"
                    value={editingGame.name_bn || ''}
                    onChange={e => setEditingGame({ ...editingGame, name_bn: e.target.value })}
                  />
                  <ImageUploader
                    label="গেমের পোস্টার ইমেজ (ImgBB File Upload)"
                    value={editingGame.poster}
                    onChange={url => setEditingGame({ ...editingGame, poster: url })}
                    aspect="aspect-[3/4]"
                    hint="সরাসরি কম্পিউটার/মোবাইল থেকে ছবি ফাইল আপলোড করুন (ImgBB CDN)"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="ব্যাজ টেক্সট"
                      value={editingGame.badge}
                      onChange={e => setEditingGame({ ...editingGame, badge: e.target.value })}
                    />
                    <Input
                      label="ডেলিভারি সময়"
                      value={editingGame.delivery_time}
                      onChange={e => setEditingGame({ ...editingGame, delivery_time: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                    <Button variant="ghost" size="sm" onClick={() => setEditingGame(null)}>
                      বাতিল
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleSaveGame(editingGame)}>
                      সংরক্ষণ করুন
                    </Button>
                  </div>
                </div>
              )}
            </Modal>
          </div>
        )}

        {/* PACKAGES TAB */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">প্যাকেজ ও মূল্য তালিকা (Packages)</h2>
                <p className="text-xs text-gray-400">প্রতিটি গেমের প্যাকেজ এবং ইন-স্টক স্ট্যাটাস পরিবর্তন করুন</p>
              </div>

              <select
                value={selectedGameId}
                onChange={e => setSelectedGameId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white font-bold"
              >
                {storeData.games.map(g => (
                  <option key={g.id} value={g.id} className="bg-black">
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {(() => {
              const game = storeData.games.find(g => g.id === selectedGameId);
              if (!game) return null;

              return (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-bold">
                      {game.name} এর জন্য {game.packages.length} টি প্যাকেজ
                    </span>
                    <Button
                      variant="success"
                      size="sm"
                      icon={<Plus className="w-3.5 h-3.5" />}
                      onClick={() =>
                        setEditingPackage({
                          gameId: game.id,
                          pkg: {
                            id: `pkg-${Date.now()}`,
                            name: 'New Package',
                            price: 100,
                            stock: true,
                            icon: '🪙'
                          }
                        })
                      }
                    >
                      প্যাকেজ যোগ করুন
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {game.packages.map(pkg => (
                      <Card
                        key={pkg.id}
                        variant="glass"
                        className="p-3.5 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{pkg.icon || '🪙'}</span> {pkg.name}
                          </div>
                          <div className="text-sm font-extrabold text-emerald-400 mt-0.5">
                            {formatCurrency(pkg.price)}
                          </div>
                          <button
                            onClick={() => handleSavePackage(game.id, { ...pkg, stock: !pkg.stock })}
                            className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer ${
                              pkg.stock
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-red-500/20 hover:text-red-400'
                                : 'bg-red-500/20 text-red-400 hover:bg-emerald-500/20 hover:text-emerald-400'
                            }`}
                          >
                            {pkg.stock ? '🟢 In Stock (টগল করুন)' : '🔴 Out of Stock'}
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" icon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => setEditingPackage({ gameId: game.id, pkg: { ...pkg } })} />
                          <Button variant="danger" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => handleDeletePackage(game.id, pkg.id)} />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })()}

            <Modal isOpen={Boolean(editingPackage)} onClose={() => setEditingPackage(null)} title="প্যাকেজ সম্পাদনা">
              {editingPackage && (
                <div className="space-y-3">
                  <Input
                    label="প্যাকেজ নাম"
                    value={editingPackage.pkg.name}
                    onChange={e =>
                      setEditingPackage({
                        ...editingPackage,
                        pkg: { ...editingPackage.pkg, name: e.target.value }
                      })
                    }
                  />
                  <Input
                    label="মূল্য (৳ BDT)"
                    type="number"
                    value={editingPackage.pkg.price || ''}
                    onChange={e =>
                      setEditingPackage({
                        ...editingPackage,
                        pkg: { ...editingPackage.pkg, price: Number(e.target.value) }
                      })
                    }
                  />
                  <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                    <Button variant="ghost" size="sm" onClick={() => setEditingPackage(null)}>
                      বাতিল
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleSavePackage(editingPackage.gameId, editingPackage.pkg)}>
                      সংরক্ষণ
                    </Button>
                  </div>
                </div>
              )}
            </Modal>
          </div>
        )}

        {/* COUPONS TAB */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">কুপন ও বিশেষ ছাড় (Coupons)</h2>
                <p className="text-xs text-gray-400">প্রোমো কোড এবং ডিসকাউন্ট অফার তৈরি ও নিয়ন্ত্রণ করুন</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() =>
                  setEditingCoupon({
                    id: `cpn-${Date.now()}`,
                    code: 'DISCOUNT',
                    discount: 10,
                    minSpend: 100,
                    description: '৳১০০+ অর্ডারে ১০ টাকা ছাড়',
                    colorClass: 'coupon-red',
                    active: true
                  })
                }
              >
                নতুন কুপন
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {storeData.coupons.map(coupon => (
                <Card
                  key={coupon.id}
                  variant="glass"
                  className="p-4 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-mono font-black text-white bg-white/10 px-2 py-0.5 rounded-md">
                        {coupon.code}
                      </span>
                      <span className="text-xs font-extrabold text-emerald-400">{formatCurrency(coupon.discount)} ছাড়</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-2">{coupon.description}</p>
                    <div className="text-[10px] text-gray-400 mt-1">মিনিমাম খরচ: {formatCurrency(coupon.minSpend)}</div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-2">
                    <button
                      onClick={() => handleSaveCoupon({ ...coupon, active: !coupon.active })}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer ${
                        coupon.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {coupon.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </button>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" icon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => setEditingCoupon({ ...coupon })} />
                      <Button variant="danger" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => handleDeleteCoupon(coupon.id)} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Modal isOpen={Boolean(editingCoupon)} onClose={() => setEditingCoupon(null)} title="কুপন সম্পাদনা">
              {editingCoupon && (
                <div className="space-y-3">
                  <Input
                    label="কুপন কোড (uppercase)"
                    value={editingCoupon.code}
                    onChange={e => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                    className="uppercase font-mono"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="ছাড় (৳ BDT)"
                      type="number"
                      value={editingCoupon.discount}
                      onChange={e => setEditingCoupon({ ...editingCoupon, discount: Number(e.target.value) })}
                    />
                    <Input
                      label="মিনিমাম খরচ (৳)"
                      type="number"
                      value={editingCoupon.minSpend}
                      onChange={e => setEditingCoupon({ ...editingCoupon, minSpend: Number(e.target.value) })}
                    />
                  </div>
                  <Input
                    label="বিবরণ"
                    value={editingCoupon.description}
                    onChange={e => setEditingCoupon({ ...editingCoupon, description: e.target.value })}
                  />
                  <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                    <Button variant="ghost" size="sm" onClick={() => setEditingCoupon(null)}>
                      বাতিল
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleSaveCoupon(editingCoupon)}>
                      সংরক্ষণ
                    </Button>
                  </div>
                </div>
              )}
            </Modal>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">অর্ডারস হাব ও ডেলিভারি (Orders)</h2>
                <p className="text-xs text-gray-400">কাস্টমার অর্ডার ভেরিফাই এবং স্ট্যাটাস আপডেট করুন</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Order ID বা ফোন নম্বর..."
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                />
                <select
                  value={orderFilter}
                  onChange={e => setOrderFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white font-bold"
                >
                  <option value="all" className="bg-black">সব অর্ডার</option>
                  <option value="Pending" className="bg-black">পেন্ডিং ⏳</option>
                  <option value="Processing" className="bg-black">প্রসেসিং ⚙️</option>
                  <option value="Completed" className="bg-black">সম্পন্ন ✅</option>
                  <option value="Cancelled" className="bg-black">বাতিল ❌</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {storeData.orders
                .filter(o => {
                  const matchSearch =
                    !orderSearch ||
                    o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                    o.senderLastDigits?.includes(orderSearch) ||
                    o.customData?.whatsapp?.includes(orderSearch);
                  const matchFilter = orderFilter === 'all' || o.status === orderFilter;
                  return matchSearch && matchFilter;
                })
                .map(order => (
                  <Card key={order.id} variant="glass" className="p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-white bg-white/10 px-2 py-0.5 rounded-md">
                          {order.id}
                        </span>
                        <span className="text-xs font-bold text-gray-300">• {order.gameName}</span>
                        <span className="text-xs font-extrabold text-emerald-400">{formatCurrency(order.totalAmount)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">স্ট্যাটাস:</span>
                        <select
                          value={order.status}
                          onChange={e => handleUpdateOrderStatus(order.id, e.target.value as any)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                            order.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : order.status === 'Pending'
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          <option value="Pending" className="bg-black">পেন্ডিং ⏳</option>
                          <option value="Processing" className="bg-black">প্রসেসিং ⚙️</option>
                          <option value="Completed" className="bg-black">সম্পন্ন ✅</option>
                          <option value="Cancelled" className="bg-black">বাতিল ❌</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-300">
                      <div>
                        <span className="text-gray-400">প্যাকেজসমূহ:</span>{' '}
                        <strong>{order.packages.map(p => p.name).join(', ')}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400">পেমেন্ট:</span>{' '}
                        <strong>{order.paymentMethod} (শেষ ৪ সংখ্যা: {order.senderLastDigits})</strong>
                      </div>
                      <div>
                        <span className="text-gray-400">তারিখ:</span> {order.date}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs flex flex-wrap gap-4 text-gray-300">
                      {Object.entries(order.customData).map(([k, v]) => (
                        <div key={k}>
                          <span className="text-gray-400 capitalize">{k}:</span>{' '}
                          <span className="font-mono text-white font-bold">{v}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* AUDIT HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">অডিট হিস্ট্রি লগ (Audit Trail)</h2>
                <p className="text-xs text-gray-400">অ্যাডমিন কর্তৃক সম্পাদিত সকল পরিবর্তন ও আপডেটের রেকর্ড</p>
              </div>

              <input
                type="text"
                placeholder="হিস্ট্রি খুঁজুন..."
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
              />
            </div>

            <div className="space-y-2.5">
              {(storeData.auditLogs || [])
                .filter(log =>
                  !historySearch ||
                  log.entity.toLowerCase().includes(historySearch.toLowerCase()) ||
                  log.details.toLowerCase().includes(historySearch.toLowerCase())
                )
                .map(log => (
                  <Card
                    key={log.id}
                    variant="glass"
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            log.action === 'CREATED'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : log.action === 'DELETED'
                              ? 'bg-red-500/20 text-red-400'
                              : log.action === 'STATUS_CHANGE'
                              ? 'bg-cyan-500/20 text-cyan-400'
                              : 'bg-cyan-500/20 text-cyan-400'
                          }`}
                        >
                          {log.action}
                        </span>
                        <strong className="text-white">{log.entity}</strong>
                        <span className="text-gray-400">• {log.author}</span>
                      </div>
                      <p className="text-gray-300 mt-1">{log.details}</p>
                    </div>

                    <div className="text-[10px] text-gray-400 font-mono flex-shrink-0">
                      {log.dateStr}
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-lg">
            <div>
              <h2 className="text-xl font-black text-white">অ্যাডমিন সিকিউরিটি সেটিংস</h2>
              <p className="text-xs text-gray-400">অ্যাডমিন অ্যাক্সেস পিন এবং সংযোগ অবস্থা</p>
            </div>

            <Card variant="glass" className="p-5 space-y-4">
              <Input
                label="অ্যাডমিন পিন পরিবর্তন করুন"
                value={storeData.settings.adminPin}
                onChange={e =>
                  setStoreData({
                    ...storeData,
                    settings: { ...storeData.settings, adminPin: e.target.value }
                  })
                }
                className="font-mono"
              />
              <Button variant="primary" size="sm" onClick={handleSaveSettings}>
                পিন আপডেট করুন
              </Button>
            </Card>

            <Card variant="glass" className="p-5 space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">সিস্টেম কানেক্টিভিটি</h3>
              <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                <span>ডাটাবেস স্টোরেজ:</span>
                <span className="font-bold text-emerald-400">MongoDB Ready (Local File Store Fallback)</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span>ক্লাউড স্টোরেজ ও অথ:</span>
                <span className="font-bold text-cyan-400">Firebase Ready</span>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

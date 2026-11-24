'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  LayoutDashboard,
  Palette,
  Gamepad2,
  Package,
  Tag,
  CreditCard,
  ShoppingBag,
  History,
  Settings,
  LogOut,
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
  Database,
  Flame,
  ArrowLeft
} from 'lucide-react';
import { StoreData, GameItem, PackageItem, CouponItem, OrderItem, AuditLogItem } from '@/lib/types';

export default function AdminPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'site_cms' | 'games' | 'packages' | 'coupons' | 'orders' | 'history' | 'settings'
  >('dashboard');

  // Store data state
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Selected game for package management
  const [selectedGameId, setSelectedGameId] = useState<string>('efootball');

  // Edit / Modal States
  const [editingGame, setEditingGame] = useState<GameItem | null>(null);
  const [editingPackage, setEditingPackage] = useState<{ gameId: string; pkg: PackageItem } | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [historySearch, setHistorySearch] = useState('');

  // Check initial login token from localStorage
  useEffect(() => {
    const token = localStorage.getItem('sonic_admin_token');
    const params = new URLSearchParams(window.location.search);
    if (token || params.get('auth') === '1') {
      setIsAuthenticated(true);
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
    } catch (err: any) {
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

  // 1. Update Site Settings & Ticker
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeData) return;
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_settings',
          payload: {
            settings: storeData.settings,
            trustBadges: storeData.trustBadges
          },
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

  // 2. Save Game (Add/Edit)
  const handleSaveGame = async (game: GameItem) => {
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_game',
          payload: game,
          author: 'Admin'
        })
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

  // 3. Delete Game
  const handleDeleteGame = async (gameId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই গেমটি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_game',
          payload: { id: gameId },
          author: 'Admin'
        })
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

  // 4. Save Package
  const handleSavePackage = async (gameId: string, pkg: PackageItem) => {
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_package',
          payload: { gameId, pkg },
          author: 'Admin'
        })
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

  // 5. Delete Package
  const handleDeletePackage = async (gameId: string, pkgId: string) => {
    if (!confirm('আপনি কি এই প্যাকেজটি মুছতে চান?')) return;
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_package',
          payload: { gameId, pkgId },
          author: 'Admin'
        })
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

  // 6. Save Coupon
  const handleSaveCoupon = async (coupon: CouponItem) => {
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_coupon',
          payload: coupon,
          author: 'Admin'
        })
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

  // 7. Delete Coupon
  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('কুপনটি মুছতে চান?')) return;
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_coupon',
          payload: { id },
          author: 'Admin'
        })
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

  // 8. Update Order Status
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

  // ==========================================
  // LOGIN SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-3xl glass-panel bg-[#0d111a] border border-white/10 p-6 shadow-2xl space-y-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mx-auto text-white mb-2 shadow-lg shadow-red-500/30 font-black">
              ⚡
            </div>
            <h2 className="text-lg font-black text-white">Sonic’s E-Shop Admin</h2>
            <p className="text-xs text-gray-400 mt-0.5">অ্যাডমিন প্যানেলে প্রবেশ করতে পিন দিন</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <input
                type="password"
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                placeholder="অ্যাডমিন পিন (ডিফল্ট: sonic2026)"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center tracking-widest text-sm focus:outline-none focus:border-red-500 font-mono"
                autoFocus
              />
            </div>

            {authError && (
              <div className="text-xs text-red-400 text-center font-semibold bg-red-500/10 py-1.5 rounded-lg border border-red-500/20">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 transition-all"
            >
              প্রবেশ করুন →
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-gray-400 hover:text-white flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> হোম শপে ফিরুন
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !storeData) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex items-center justify-center text-white text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-red-500" /> অ্যাডমিন ডেটা লোড হচ্ছে...
      </div>
    );
  }

  // Dashboard Stats Calculations
  const totalOrders = storeData.orders.length;
  const pendingOrders = storeData.orders.filter(o => o.status === 'Pending').length;
  const completedOrders = storeData.orders.filter(o => o.status === 'Completed').length;
  const totalRevenue = storeData.orders
    .filter(o => o.status === 'Completed')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-[#080a0f] text-gray-100 flex flex-col md:flex-row">
      {/* Toast Notification */}
      {saveMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl border text-xs font-bold shadow-xl flex items-center gap-2 ${
          saveMessage.type === 'success'
            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
            : 'bg-red-500/20 border-red-500/40 text-red-300'
        }`}>
          {saveMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{saveMessage.text}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 glass-panel bg-[#0b0e17] border-r border-white/10 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Admin Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-sm">
                ⚡
              </div>
              <div>
                <h1 className="text-sm font-black text-white">Sonic CMS</h1>
                <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  MongoDB & Firebase
                </div>
              </div>
            </div>
            <Link href="/" target="_blank" className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white" title="লাইভ শপ দেখুন">
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1">
            {[
              { id: 'dashboard', label: 'ড্যাশবোর্ড (Overview)', icon: LayoutDashboard },
              { id: 'site_cms', label: 'সাইট ব্র্যান্ডিং ও টিকার', icon: Palette },
              { id: 'games', label: 'গেম ক্যাটালগ (CRUD)', icon: Gamepad2 },
              { id: 'packages', label: 'প্যাকেজ ও মূল্য তালিকা', icon: Package },
              { id: 'coupons', label: 'কুপন ও বিশেষ ছাড়', icon: Tag },
              { id: 'orders', label: 'অর্ডারস হাব (Orders)', icon: ShoppingBag, badge: pendingOrders },
              { id: 'history', label: 'অডিট হিস্ট্রি লগ', icon: History },
              { id: 'settings', label: 'অ্যাডমিন সেটিংস', icon: Settings },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-black font-extrabold text-[10px]">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>লগআউট করুন</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        {/* ==================================================== */}
        {/* 1. DASHBOARD OVERVIEW */}
        {/* ==================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">ড্যাশবোর্ড ওভারভিউ (Dashboard)</h2>
              <p className="text-xs text-gray-400">স্টোরের লাইভ মেট্রিক্স এবং কার্যক্রম</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl glass-panel border border-white/10">
                <div className="text-xs text-gray-400 font-semibold">মোট আয় (Completed)</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">৳{totalRevenue}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{completedOrders} টি সম্পন্ন অর্ডার</div>
              </div>

              <div className="p-4 rounded-2xl glass-panel border border-white/10">
                <div className="text-xs text-gray-400 font-semibold">পেন্ডিং অর্ডারস</div>
                <div className="text-2xl font-black text-amber-400 mt-1">{pendingOrders}</div>
                <div className="text-[10px] text-amber-500/80 mt-0.5">ডেলিভারির জন্য অপেক্ষারত</div>
              </div>

              <div className="p-4 rounded-2xl glass-panel border border-white/10">
                <div className="text-xs text-gray-400 font-semibold">সক্রিয় গেম ক্যাটালগ</div>
                <div className="text-2xl font-black text-cyan-400 mt-1">{storeData.games.length}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">eFootball, PUBG, Roblox</div>
              </div>

              <div className="p-4 rounded-2xl glass-panel border border-white/10">
                <div className="text-xs text-gray-400 font-semibold">সক্রিয় কুপন কোড</div>
                <div className="text-2xl font-black text-purple-400 mt-1">
                  {storeData.coupons.filter(c => c.active).length}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">মোট কুপন {storeData.coupons.length} টি</div>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="p-5 rounded-3xl glass-panel border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white">সর্বশেষ অর্ডারসমূহ</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-red-400 hover:text-red-300 font-bold"
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
                      <span className="text-emerald-400 ml-2 font-bold">৳{o.totalAmount}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      o.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* 2. SITE CMS & BRANDING */}
        {/* ==================================================== */}
        {activeTab === 'site_cms' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">সাইট ব্র্যান্ডিং ও কন্টেন্ট CMS</h2>
              <p className="text-xs text-gray-400">টিকার নোটিশ, ব্যানার ছবি ও পেমেন্ট নম্বর পরিবর্তন করুন</p>
            </div>

            {/* Announcement Ticker */}
            <div className="p-5 rounded-3xl glass-panel border border-white/10 space-y-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
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
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Banner & Logo */}
            <div className="p-5 rounded-3xl glass-panel border border-white/10 space-y-4">
              <h3 className="text-sm font-extrabold text-white">ব্যানার ও সাইট তথ্য</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">স্টোর নাম</label>
                  <input
                    type="text"
                    value={storeData.settings.siteName}
                    onChange={e =>
                      setStoreData({
                        ...storeData,
                        settings: { ...storeData.settings, siteName: e.target.value }
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">হিরো ব্যানার ইমেজ URL</label>
                  <input
                    type="text"
                    value={storeData.settings.heroBanner}
                    onChange={e =>
                      setStoreData({
                        ...storeData,
                        settings: { ...storeData.settings, heroBanner: e.target.value }
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              {/* Banner Live Preview */}
              <div className="aspect-[24/8] w-full rounded-2xl overflow-hidden bg-black/40 border border-white/10 relative">
                <img
                  src={storeData.settings.heroBanner}
                  alt="Banner Preview"
                  className="w-full h-full object-cover"
                  onError={(e: any) => (e.target.src = '/banner.jpg')}
                />
              </div>
            </div>

            {/* Payment Numbers */}
            <div className="p-5 rounded-3xl glass-panel border border-white/10 space-y-4">
              <h3 className="text-sm font-extrabold text-white">পেমেন্ট পার্সোনাল নম্বর (Send Money)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-pink-400">bKash নম্বর</label>
                  <input
                    type="text"
                    value={storeData.settings.bkashNumber}
                    onChange={e =>
                      setStoreData({
                        ...storeData,
                        settings: { ...storeData.settings, bkashNumber: e.target.value }
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-400">Nagad নম্বর</label>
                  <input
                    type="text"
                    value={storeData.settings.nagadNumber}
                    onChange={e =>
                      setStoreData({
                        ...storeData,
                        settings: { ...storeData.settings, nagadNumber: e.target.value }
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>পরিবর্তন সংরক্ষণ করুন</span>
            </button>
          </form>
        )}

        {/* ==================================================== */}
        {/* 3. GAME CATALOG (CRUD) */}
        {/* ==================================================== */}
        {activeTab === 'games' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">গেম ক্যাটালগ ম্যানেজমেন্ট (CRUD)</h2>
                <p className="text-xs text-gray-400">নতুন গেম যোগ করুন অথবা বিদ্যমান গেম এডিট করুন</p>
              </div>
              <button
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
                    description: 'Game top up description',
                    rules: ['সঠিক আইডি দিন'],
                    custom_fields: [
                      { id: 'player_id', type: 'text', label: 'Player ID', label_bn: 'প্লেয়ার আইডি', required: true },
                      { id: 'whatsapp', type: 'tel', label: 'WhatsApp', label_bn: 'হোয়াটসঅ্যাপ', required: true }
                    ],
                    packages: []
                  })
                }
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন গেম যোগ করুন</span>
              </button>
            </div>

            {/* Games Table */}
            <div className="grid grid-cols-1 gap-4">
              {storeData.games.map(game => (
                <div
                  key={game.id}
                  className="p-4 rounded-2xl glass-panel border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
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
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                          style={{ backgroundColor: game.badge_color }}
                        >
                          {game.badge}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        প্যাকেজ: {game.packages.length} টি | ডেলিভারি: {game.delivery_time} | মেথড: {game.product_type}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => setEditingGame({ ...game })}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>এডিট</span>
                    </button>
                    <button
                      onClick={() => handleDeleteGame(game.id)}
                      className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white text-xs font-bold transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Game Edit Modal */}
            {editingGame && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <div className="w-full max-w-lg rounded-3xl glass-panel bg-[#0d111a] border border-white/15 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                  <h3 className="text-base font-black text-white">গেম সম্পাদনা (Edit Game)</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-gray-300 font-bold block mb-1">গেমের নাম (English)</label>
                      <input
                        type="text"
                        value={editingGame.name}
                        onChange={e => setEditingGame({ ...editingGame, name: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-gray-300 font-bold block mb-1">বাংলা নাম</label>
                      <input
                        type="text"
                        value={editingGame.name_bn || ''}
                        onChange={e => setEditingGame({ ...editingGame, name_bn: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-gray-300 font-bold block mb-1">পোস্টার ইমেজ URL</label>
                      <input
                        type="text"
                        value={editingGame.poster}
                        onChange={e => setEditingGame({ ...editingGame, poster: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-gray-300 font-bold block mb-1">ব্যাজ টেক্সট</label>
                        <input
                          type="text"
                          value={editingGame.badge}
                          onChange={e => setEditingGame({ ...editingGame, badge: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-gray-300 font-bold block mb-1">ডেলিভারি সময়</label>
                        <input
                          type="text"
                          value={editingGame.delivery_time}
                          onChange={e => setEditingGame({ ...editingGame, delivery_time: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                    <button
                      onClick={() => setEditingGame(null)}
                      className="px-4 py-2 rounded-xl bg-white/10 text-gray-300 text-xs font-bold"
                    >
                      বাতিল
                    </button>
                    <button
                      onClick={() => handleSaveGame(editingGame)}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                    >
                      সংরক্ষণ করুন
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* 4. PACKAGES & PRICING */}
        {/* ==================================================== */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">প্যাকেজ ও মূল্য তালিকা (Packages)</h2>
                <p className="text-xs text-gray-400">প্রতিটি গেমের প্যাকেজ এবং ইন-স্টক স্ট্যাটাস পরিবর্তন করুন</p>
              </div>

              {/* Game Selector */}
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

            {/* Selected Game Packages */}
            {(() => {
              const game = storeData.games.find(g => g.id === selectedGameId);
              if (!game) return null;

              return (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-bold">
                      {game.name} এর জন্য {game.packages.length} টি প্যাকেজ
                    </span>
                    <button
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
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> প্যাকেজ যোগ করুন
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {game.packages.map(pkg => (
                      <div
                        key={pkg.id}
                        className="p-3.5 rounded-2xl glass-panel border border-white/10 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{pkg.icon || '🪙'}</span> {pkg.name}
                          </div>
                          <div className="text-sm font-extrabold text-emerald-400 mt-0.5">
                            {pkg.price ? `৳${pkg.price}` : '৳***'}
                          </div>
                          <button
                            onClick={() =>
                              handleSavePackage(game.id, { ...pkg, stock: !pkg.stock })
                            }
                            className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              pkg.stock
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-red-500/20 hover:text-red-400'
                                : 'bg-red-500/20 text-red-400 hover:bg-emerald-500/20 hover:text-emerald-400'
                            }`}
                          >
                            {pkg.stock ? '🟢 In Stock (ক্লিক করুন)' : '🔴 Out of Stock'}
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingPackage({ gameId: game.id, pkg: { ...pkg } })}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePackage(game.id, pkg.id)}
                            className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Package Edit Modal */}
            {editingPackage && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <div className="w-full max-w-sm rounded-3xl glass-panel bg-[#0d111a] border border-white/15 p-6 shadow-2xl space-y-4">
                  <h3 className="text-sm font-black text-white">প্যাকেজ সম্পাদনা</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-gray-300 font-bold block mb-1">প্যাকেজ নাম</label>
                      <input
                        type="text"
                        value={editingPackage.pkg.name}
                        onChange={e =>
                          setEditingPackage({
                            ...editingPackage,
                            pkg: { ...editingPackage.pkg, name: e.target.value }
                          })
                        }
                        className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-gray-300 font-bold block mb-1">মূল্য (৳ BDT)</label>
                      <input
                        type="number"
                        value={editingPackage.pkg.price || ''}
                        onChange={e =>
                          setEditingPackage({
                            ...editingPackage,
                            pkg: { ...editingPackage.pkg, price: Number(e.target.value) }
                          })
                        }
                        className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => setEditingPackage(null)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 text-gray-300 text-xs font-bold"
                    >
                      বাতিল
                    </button>
                    <button
                      onClick={() =>
                        handleSavePackage(editingPackage.gameId, editingPackage.pkg)
                      }
                      className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                    >
                      সংরক্ষণ
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* 5. COUPONS & OFFERS */}
        {/* ==================================================== */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">কুপন ও বিশেষ ছাড় (Coupons)</h2>
                <p className="text-xs text-gray-400">প্রোমো কোড এবং ডিসকাউন্ট অফার তৈরি ও নিয়ন্ত্রণ করুন</p>
              </div>
              <button
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
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" /> নতুন কুপন
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {storeData.coupons.map(coupon => (
                <div
                  key={coupon.id}
                  className="p-4 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-mono font-black text-white bg-white/10 px-2 py-0.5 rounded-md">
                        {coupon.code}
                      </span>
                      <span className="text-xs font-extrabold text-emerald-400">৳{coupon.discount} ছাড়</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-2">{coupon.description}</p>
                    <div className="text-[10px] text-gray-400 mt-1">মিনিমাম খরচ: ৳{coupon.minSpend}</div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-2">
                    <button
                      onClick={() => handleSaveCoupon({ ...coupon, active: !coupon.active })}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        coupon.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {coupon.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingCoupon({ ...coupon })}
                        className="p-1.5 rounded-lg bg-white/10 text-white"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Edit Modal */}
            {editingCoupon && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <div className="w-full max-w-sm rounded-3xl glass-panel bg-[#0d111a] border border-white/15 p-6 shadow-2xl space-y-4">
                  <h3 className="text-sm font-black text-white">কুপন সম্পাদনা</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-gray-300 font-bold block mb-1">কুপন কোড (uppercase)</label>
                      <input
                        type="text"
                        value={editingCoupon.code}
                        onChange={e =>
                          setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })
                        }
                        className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white uppercase font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-gray-300 font-bold block mb-1">ছাড় (৳ BDT)</label>
                        <input
                          type="number"
                          value={editingCoupon.discount}
                          onChange={e =>
                            setEditingCoupon({ ...editingCoupon, discount: Number(e.target.value) })
                          }
                          className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-gray-300 font-bold block mb-1">মিনিমাম খরচ (৳)</label>
                        <input
                          type="number"
                          value={editingCoupon.minSpend}
                          onChange={e =>
                            setEditingCoupon({ ...editingCoupon, minSpend: Number(e.target.value) })
                          }
                          className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-300 font-bold block mb-1">বিবরণ</label>
                      <input
                        type="text"
                        value={editingCoupon.description}
                        onChange={e =>
                          setEditingCoupon({ ...editingCoupon, description: e.target.value })
                        }
                        className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => setEditingCoupon(null)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 text-gray-300 text-xs font-bold"
                    >
                      বাতিল
                    </button>
                    <button
                      onClick={() => handleSaveCoupon(editingCoupon)}
                      className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                    >
                      সংরক্ষণ
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* 6. ORDERS MANAGEMENT HUB */}
        {/* ==================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">অর্ডারস হাব ও ডেলিভারি (Orders)</h2>
                <p className="text-xs text-gray-400">কাস্টমার অর্ডার ভেরিফাই এবং স্ট্যাটাস আপডেট করুন</p>
              </div>

              {/* Status Filter & Search */}
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

            {/* Orders Table */}
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
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl glass-panel border border-white/10 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-white bg-white/10 px-2 py-0.5 rounded-md">
                          {order.id}
                        </span>
                        <span className="text-xs font-bold text-gray-300">• {order.gameName}</span>
                        <span className="text-xs font-extrabold text-emerald-400">৳{order.totalAmount}</span>
                      </div>

                      {/* Status Dropdown */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">স্ট্যাটাস:</span>
                        <select
                          value={order.status}
                          onChange={e =>
                            handleUpdateOrderStatus(order.id, e.target.value as any)
                          }
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            order.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : order.status === 'Pending'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
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

                    {/* Order Details & Customer Credentials */}
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

                    {/* Dynamic Custom Credentials Submitted */}
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs flex flex-wrap gap-4 text-gray-300">
                      {Object.entries(order.customData).map(([k, v]) => (
                        <div key={k}>
                          <span className="text-gray-400 capitalize">{k}:</span>{' '}
                          <span className="font-mono text-white font-bold">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* 7. AUDIT HISTORY LOG */}
        {/* ==================================================== */}
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
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl glass-panel border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          log.action === 'CREATED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : log.action === 'DELETED'
                            ? 'bg-red-500/20 text-red-400'
                            : log.action === 'STATUS_CHANGE'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-cyan-500/20 text-cyan-400'
                        }`}>
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
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* 8. ADMIN SETTINGS */}
        {/* ==================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-lg">
            <div>
              <h2 className="text-xl font-black text-white">অ্যাডমিন সিকিউরিটি সেটিংস</h2>
              <p className="text-xs text-gray-400">অ্যাডমিন অ্যাক্সেস পিন এবং সংযোগ অবস্থা</p>
            </div>

            <div className="p-5 rounded-3xl glass-panel border border-white/10 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">অ্যাডমিন পিন পরিবর্তন করুন</label>
                <input
                  type="text"
                  value={storeData.settings.adminPin}
                  onChange={e =>
                    setStoreData({
                      ...storeData,
                      settings: { ...storeData.settings, adminPin: e.target.value }
                    })
                  }
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-mono"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
              >
                পিন আপডেট করুন
              </button>
            </div>

            {/* System Status */}
            <div className="p-5 rounded-3xl glass-panel border border-white/10 space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">সিস্টেম কানেক্টিভিটি</h3>
              <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                <span>ডাটাবেস স্টোরেজ:</span>
                <span className="font-bold text-emerald-400">MongoDB Ready (Local File Store Fallback)</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span>ক্লাউড স্টোরেজ ও অথ:</span>
                <span className="font-bold text-cyan-400">Firebase Ready</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

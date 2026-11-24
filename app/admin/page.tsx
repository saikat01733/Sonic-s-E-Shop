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
  ArrowLeft,
  Crown,
  User,
  Users,
  Shield,
  Tag,
  Gamepad2,
  Package,
  Layers,
  Palette
} from 'lucide-react';
import { StoreData, GameItem, PackageItem, CouponItem, OrderItem, HeroSlide, TrustBadge, UserProfile } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { ImageUploader } from '@/components/common/ImageUploader';
import { useAuth } from '@/hooks/use-auth';

export default function AdminPage() {
  const { user, isAuthenticated: isUserAuth, isAdmin, logout } = useAuth();
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
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [historySearch, setHistorySearch] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as AdminTab;
    if (tabParam) {
      setActiveTab(tabParam);
    }
    fetchStoreData();
  }, [isAdmin, user]);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/cms');
      const json = await res.json();
      if (json.success) {
        setStoreData(json.data);
      }
    } catch (e) {
      console.error('[Admin] Fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setSaveMessage({ text, type });
    setTimeout(() => setSaveMessage(null), 3500);
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
          author: user?.name || 'Admin'
        })
      });
      const json = await res.json();
      if (json.success) {
        showNotice('Site branding and settings updated successfully!');
        fetchStoreData();
      } else {
        showNotice(json.error || 'Failed to update settings', 'error');
      }
    } catch (e: any) {
      showNotice(e.message || 'Network error saving settings', 'error');
    }
  };

  const handleSaveGame = async (game: GameItem) => {
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_game', payload: game, author: user?.name || 'Admin' })
      });
      const json = await res.json();
      if (json.success) {
        showNotice(`Game '${game.name}' saved successfully!`);
        setEditingGame(null);
        fetchStoreData();
      } else {
        showNotice(json.error || 'Failed to save game', 'error');
      }
    } catch (e: any) {
      showNotice(e.message || 'Error saving game', 'error');
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm('Are you sure you want to permanently delete this game?')) return;
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_game', payload: { id: gameId }, author: user?.name || 'Admin' })
      });
      const json = await res.json();
      if (json.success) {
        showNotice('Game deleted successfully!');
        fetchStoreData();
      } else {
        showNotice(json.error || 'Failed to delete game', 'error');
      }
    } catch (e: any) {
      showNotice(e.message || 'Error deleting game', 'error');
    }
  };

  const handleSavePackage = async (gameId: string, pkg: PackageItem) => {
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_package', payload: { gameId, pkg }, author: user?.name || 'Admin' })
      });
      const json = await res.json();
      if (json.success) {
        showNotice(`Package '${pkg.name}' saved successfully!`);
        setEditingPackage(null);
        fetchStoreData();
      } else {
        showNotice(json.error || 'Failed to save package', 'error');
      }
    } catch (e: any) {
      showNotice(e.message || 'Error saving package', 'error');
    }
  };

  const handleDeletePackage = async (gameId: string, pkgId: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_package', payload: { gameId, pkgId }, author: user?.name || 'Admin' })
      });
      const json = await res.json();
      if (json.success) {
        showNotice('Package deleted successfully!');
        fetchStoreData();
      } else {
        showNotice(json.error || 'Failed to delete package', 'error');
      }
    } catch (e: any) {
      showNotice(e.message || 'Error deleting package', 'error');
    }
  };

  const handleSaveCoupon = async (coupon: CouponItem) => {
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_coupon', payload: coupon, author: user?.name || 'Admin' })
      });
      const json = await res.json();
      if (json.success) {
        showNotice(`Coupon '${coupon.code}' saved successfully!`);
        setEditingCoupon(null);
        fetchStoreData();
      } else {
        showNotice(json.error || 'Failed to save coupon', 'error');
      }
    } catch (e: any) {
      showNotice(e.message || 'Error saving coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_coupon', payload: { id }, author: user?.name || 'Admin' })
      });
      const json = await res.json();
      if (json.success) {
        showNotice('Coupon deleted successfully!');
        fetchStoreData();
      } else {
        showNotice(json.error || 'Failed to delete coupon', 'error');
      }
    } catch (e: any) {
      showNotice(e.message || 'Error deleting coupon', 'error');
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
          author: user?.name || 'Admin'
        })
      });
      const json = await res.json();
      if (json.success) {
        showNotice(`Hero slide '${slide.title}' saved successfully!`);
        setEditingSlide(null);
        fetchStoreData();
      } else {
        showNotice(json.error || 'Failed to save hero slide', 'error');
      }
    } catch (e: any) {
      showNotice(e.message || 'Error saving slide', 'error');
    }
  };

  const handleDeleteSlide = async (slideId: string) => {
    if (!storeData) return;
    if (!confirm('Are you sure you want to delete this hero slide?')) return;
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
          author: user?.name || 'Admin'
        })
      });
      const json = await res.json();
      if (json.success) {
        showNotice('Hero slide deleted successfully!');
        fetchStoreData();
      } else {
        showNotice(json.error || 'Failed to delete slide', 'error');
      }
    } catch (e: any) {
      showNotice(e.message || 'Error deleting slide', 'error');
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
          author: user?.name || 'Admin'
        })
      });
      const json = await res.json();
      if (json.success) {
        showNotice(`Trust badge '${badge.title}' saved successfully!`);
        setEditingTrustBadge(null);
        fetchStoreData();
      } else {
        showNotice(json.error || 'Failed to save trust badge', 'error');
      }
    } catch (e: any) {
      showNotice(e.message || 'Error saving badge', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderItem['status']) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status, author: user?.name || 'Admin' })
      });
      const json = await res.json();
      if (json.success) {
        showNotice(`Order ${orderId} status updated to '${status}'!`);
        fetchStoreData();
      } else {
        showNotice(json.error || 'Failed to update order status', 'error');
      }
    } catch (e: any) {
      showNotice(e.message || 'Error updating order', 'error');
    }
  };

  const handleSaveUser = async (targetUser: UserProfile) => {
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_user', payload: targetUser, author: user?.name || 'Admin' })
      });
      const json = await res.json();
      if (json.success) {
        showNotice(`User '${targetUser.name}' updated successfully!`);
        setEditingUser(null);
        fetchStoreData();
      } else {
        showNotice(json.error || 'Failed to update user', 'error');
      }
    } catch (e: any) {
      showNotice(e.message || 'Error updating user profile', 'error');
    }
  };

  // Admin Access Gate: Direct role verification (No PIN required)
  if (!isAdmin && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="glass" className="w-full max-w-sm p-6 text-center space-y-4 border-white/20 [html.light-theme_&]:border-black/10 shadow-2xl backdrop-blur-3xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center mx-auto text-white mb-2 shadow-lg shadow-rose-950/40 font-black">
            ⚡
          </div>
          <h2 className="text-lg font-black text-white [html.light-theme_&]:text-slate-900">Sonic’s E-Shop Admin</h2>
          <p className="text-xs text-gray-300 [html.light-theme_&]:text-slate-600 mt-0.5 leading-relaxed">
            {isUserAuth 
              ? `Signed in as ${user?.email || user?.name} (${user?.role}). Administrator privileges are required to access this control center.`
              : 'Please log in with an authorized Administrator Google or Email account to access the Control Center.'
            }
          </p>

          <Link
            href="/login?redirect=/admin"
            className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs inline-flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
          >
            <User className="w-4 h-4" />
            <span>{isUserAuth ? 'Switch to Admin Account' : 'Login with Admin Account'}</span>
          </Link>
        </Card>
      </div>
    );
  }

  if (loading || !storeData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white text-xs">
        <RefreshCw className="w-6 h-6 animate-spin text-rose-500 mb-2" />
        <span className="font-bold text-gray-300">Synchronizing Control Center...</span>
      </div>
    );
  }

  const pendingOrders = storeData.orders.filter(o => o.status === 'Pending');
  const completedOrders = storeData.orders.filter(o => o.status === 'Completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="min-h-screen flex flex-col md:flex-row p-3 sm:p-5 gap-4">
      {/* Toast Notification */}
      {saveMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-2xl backdrop-blur-xl animate-bounce ${
            saveMessage.type === 'success'
              ? 'bg-emerald-600/90 text-white border border-emerald-400/40'
              : 'bg-red-600/90 text-white border border-red-400/40'
          }`}
        >
          {saveMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-200" /> : <AlertTriangle className="w-4 h-4 text-red-200" />}
          <span>{saveMessage.text}</span>
        </div>
      )}

      {/* Admin Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingOrdersCount={pendingOrders.length}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <main className="flex-1 space-y-6 overflow-y-auto">
        {/* OVERVIEW & KPIS TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white [html.light-theme_&]:text-slate-900">Dashboard Overview</h2>
              <p className="text-xs text-gray-400 [html.light-theme_&]:text-slate-600">Live store metrics, revenue tracking, and quick management links</p>
            </div>

            <KpiGrid
              totalRevenue={totalRevenue}
              completedOrdersCount={completedOrders.length}
              pendingOrdersCount={pendingOrders.length}
              activeGamesCount={storeData.games.length}
              activeCouponsCount={storeData.coupons.filter(c => c.active).length}
              totalCouponsCount={storeData.coupons.length}
            />

            {/* Recent Orders Overview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white [html.light-theme_&]:text-slate-900">Recent Order Activity</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-rose-500 hover:text-rose-400 cursor-pointer"
                >
                  View All Orders →
                </button>
              </div>

              <div className="space-y-2">
                {storeData.orders.slice(0, 5).map(order => (
                  <Card key={order.id} variant="glass" className="p-3.5 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white [html.light-theme_&]:text-slate-900">{order.id}</span>
                        <span className="text-gray-400">• {order.gameName}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {order.packages.map(p => p.name).join(', ')} • <strong>{formatCurrency(order.totalAmount)}</strong> via {order.paymentMethod}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        order.status === 'Completed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : order.status === 'Pending'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-white/10 text-white'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SITE CMS & BRANDING TAB */}
        {activeTab === 'site_cms' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white [html.light-theme_&]:text-slate-900">Site Branding & CMS Settings</h2>
              <p className="text-xs text-gray-400 [html.light-theme_&]:text-slate-600">Update logo, hero fallback banner, header ticker text, and payment account numbers</p>
            </div>

            <Card variant="glass" className="p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-white [html.light-theme_&]:text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                Header Notice Marquee Ticker
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
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white [html.light-theme_&]:text-slate-900 [html.light-theme_&]:bg-black/5 focus:outline-none focus:border-rose-500 font-medium"
                placeholder="Enter live announcement text displayed in top ticker capsule..."
              />
            </Card>

            <Card variant="glass" className="p-5 space-y-5">
              <h3 className="text-sm font-extrabold text-white [html.light-theme_&]:text-slate-900">Branding & Direct Image Uploads (ImgBB CDN)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ImageUploader
                  label="Official Store Logo"
                  value={storeData.settings.logo || ''}
                  onChange={url =>
                    setStoreData({
                      ...storeData,
                      settings: { ...storeData.settings, logo: url }
                    })
                  }
                  aspect="aspect-square"
                  hint="Directly upload PNG/WEBP logo file to ImgBB CDN"
                />

                <ImageUploader
                  label="Hero Banner Image"
                  value={storeData.settings.heroBanner}
                  onChange={url =>
                    setStoreData({
                      ...storeData,
                      settings: { ...storeData.settings, heroBanner: url }
                    })
                  }
                  aspect="aspect-[24/8]"
                  hint="Upload wide graphic banner (e.g. 1920x640) to ImgBB CDN"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-white/10">
                <Input
                  label="Store Name (Site Title)"
                  value={storeData.settings.siteName}
                  onChange={e =>
                    setStoreData({
                      ...storeData,
                      settings: { ...storeData.settings, siteName: e.target.value }
                    })
                  }
                />
                <Input
                  label="Hero Headline Title"
                  value={storeData.settings.heroTitle || ''}
                  onChange={e =>
                    setStoreData({
                      ...storeData,
                      settings: { ...storeData.settings, heroTitle: e.target.value }
                    })
                  }
                />
                <Input
                  label="Hero Subtitle"
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
              <h3 className="text-sm font-extrabold text-white [html.light-theme_&]:text-slate-900">Payment Accounts (Send Money)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="bKash Personal Number"
                  value={storeData.settings.bkashNumber}
                  onChange={e =>
                    setStoreData({
                      ...storeData,
                      settings: { ...storeData.settings, bkashNumber: e.target.value }
                    })
                  }
                />
                <Input
                  label="Nagad Personal Number"
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
              <h3 className="text-sm font-extrabold text-white [html.light-theme_&]:text-slate-900">Customer Support & Social Links</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Support Phone Number"
                  value={storeData.settings.supportPhone || ''}
                  onChange={e =>
                    setStoreData({
                      ...storeData,
                      settings: { ...storeData.settings, supportPhone: e.target.value }
                    })
                  }
                />
                <Input
                  label="WhatsApp URL (wa.me)"
                  value={storeData.settings.whatsappUrl || ''}
                  onChange={e =>
                    setStoreData({
                      ...storeData,
                      settings: { ...storeData.settings, whatsappUrl: e.target.value }
                    })
                  }
                />
                <Input
                  label="Facebook Page URL"
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
              Save Changes
            </Button>
          </form>
        )}

        {/* HERO SLIDES TAB */}
        {activeTab === 'hero_slides' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white [html.light-theme_&]:text-slate-900">Hero Carousel Slides CMS</h2>
                <p className="text-xs text-gray-400 [html.light-theme_&]:text-slate-600">Manage homepage banner slides, titles, delivery badges, and direct links</p>
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
                    subtitle: 'Instant delivery with 100% account protection.',
                    badge: '⚡ 1-10 MINS',
                    deliveryTime: '1-10 Mins',
                    image: '/banner.webp',
                    color: '#e11d48'
                  })
                }
              >
                Add New Slide
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
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white backdrop-blur-md shadow-md">
                        {slide.badge}
                      </span>
                    </div>
                    <div className="absolute bottom-2 right-2 text-[10px] font-mono font-bold bg-black/80 px-2 py-0.5 rounded text-white">
                      ⏱ {slide.deliveryTime}
                    </div>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-black text-white [html.light-theme_&]:text-slate-900">{slide.title}</h4>
                      <p className="text-xs text-gray-300 [html.light-theme_&]:text-slate-600 line-clamp-2 mt-1">{slide.subtitle}</p>
                      <div className="text-[11px] text-rose-400 font-mono mt-2">
                        Game Link: /{slide.slug}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10 [html.light-theme_&]:border-black/10">
                      <Button
                        variant="glass"
                        size="sm"
                        icon={<Edit2 className="w-3.5 h-3.5" />}
                        onClick={() => setEditingSlide({ ...slide })}
                      >
                        Edit
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
              title="Edit Hero Slide"
            >
              {editingSlide && (
                <div className="space-y-4">
                  <ImageUploader
                    label="Slide Banner Graphic (ImgBB Upload)"
                    value={editingSlide.image}
                    onChange={url => setEditingSlide({ ...editingSlide, image: url })}
                    aspect="aspect-[21/9]"
                    hint="Drag & drop or browse image file to upload directly to ImgBB CDN"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Slide Title"
                      value={editingSlide.title}
                      onChange={e => setEditingSlide({ ...editingSlide, title: e.target.value })}
                    />
                    <Input
                      label="Top Badge Text"
                      value={editingSlide.badge}
                      onChange={e => setEditingSlide({ ...editingSlide, badge: e.target.value })}
                      placeholder="e.g. ⚡ HOT TOP-UP"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Delivery Time"
                      value={editingSlide.deliveryTime}
                      onChange={e => setEditingSlide({ ...editingSlide, deliveryTime: e.target.value })}
                      placeholder="e.g. 1-10 Mins"
                    />
                    <div>
                      <label className="block text-xs font-bold text-gray-300 [html.light-theme_&]:text-slate-800 mb-1.5">Target Game</label>
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
                        className="w-full px-3 py-2.5 rounded-xl bg-white/10 [html.light-theme_&]:bg-black/5 border border-white/15 [html.light-theme_&]:border-black/15 text-xs text-white [html.light-theme_&]:text-slate-900 font-bold"
                      >
                        {storeData.games.map(g => (
                          <option key={g.id} value={g.id} className="bg-black text-white">
                            {g.name} (/{g.slug})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 [html.light-theme_&]:text-slate-800 mb-1.5">Subtitle / Description</label>
                    <textarea
                      rows={2}
                      value={editingSlide.subtitle}
                      onChange={e => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white [html.light-theme_&]:text-slate-900 [html.light-theme_&]:bg-black/5 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                    <Button variant="ghost" size="sm" onClick={() => setEditingSlide(null)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleSaveSlide(editingSlide)}>
                      Save Slide
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
              <h2 className="text-xl font-black text-white [html.light-theme_&]:text-slate-900">Trust Badges & Perks CMS</h2>
              <p className="text-xs text-gray-400 [html.light-theme_&]:text-slate-600">Customize feature highlights in the homepage 'Why Choose Sonic’s E-Shop' section</p>
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
                    <h4 className="text-sm font-black text-white [html.light-theme_&]:text-slate-900">{badge.title}</h4>
                    <p className="text-xs text-gray-300 [html.light-theme_&]:text-slate-600 mt-1">{badge.sub}</p>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex justify-end">
                    <Button
                      variant="glass"
                      size="sm"
                      icon={<Edit2 className="w-3.5 h-3.5" />}
                      onClick={() => setEditingTrustBadge({ ...badge })}
                    >
                      Edit
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Trust Badge Edit Modal */}
            <Modal
              isOpen={Boolean(editingTrustBadge)}
              onClose={() => setEditingTrustBadge(null)}
              title="Edit Trust Feature"
            >
              {editingTrustBadge && (
                <div className="space-y-4">
                  <Input
                    label="Feature Title"
                    value={editingTrustBadge.title}
                    onChange={e => setEditingTrustBadge({ ...editingTrustBadge, title: e.target.value })}
                  />

                  <Input
                    label="Subtitle / Description"
                    value={editingTrustBadge.sub || ''}
                    onChange={e => setEditingTrustBadge({ ...editingTrustBadge, sub: e.target.value })}
                  />

                  <div>
                    <label className="block text-xs font-bold text-gray-300 [html.light-theme_&]:text-slate-800 mb-1.5">Select Icon</label>
                    <select
                      value={editingTrustBadge.icon}
                      onChange={e => setEditingTrustBadge({ ...editingTrustBadge, icon: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/10 [html.light-theme_&]:bg-black/5 border border-white/15 [html.light-theme_&]:border-black/15 text-xs text-white [html.light-theme_&]:text-slate-900 font-bold"
                    >
                      <option value="shield" className="bg-black text-white">🛡️ Shield (Security & Trust)</option>
                      <option value="zap" className="bg-black text-white">⚡ Zap (Fast Instant Delivery)</option>
                      <option value="headset" className="bg-black text-white">🎧 Headset (24/7 Gamer Support)</option>
                      <option value="users" className="bg-black text-white">👥 Users (100K+ Verified Gamers)</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                    <Button variant="ghost" size="sm" onClick={() => setEditingTrustBadge(null)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleSaveTrustBadge(editingTrustBadge)}>
                      Save Feature
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
                <h2 className="text-xl font-black text-white [html.light-theme_&]:text-slate-900">Game Catalog Management (CRUD)</h2>
                <p className="text-xs text-gray-400 [html.light-theme_&]:text-slate-600">Add new game titles, upload posters via ImgBB CDN, or edit details</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() =>
                  setEditingGame({
                    id: `game-${Date.now()}`,
                    slug: `new-game-${Date.now()}`,
                    name: 'New Game Title',
                    name_bn: 'New Game',
                    category: 'custom',
                    category_name: 'Custom',
                    badge: 'HOT',
                    badge_color: '#e11d48',
                    poster: '/banner.jpg',
                    icon: '🎮',
                    product_type: 'in_game_id',
                    delivery_time: '1-10 Mins',
                    trust_tag: '100% Secure',
                    description: 'Instant game top-up with zero password required.',
                    rules: ['Provide correct Player ID/UID'],
                    custom_fields: [
                      { id: 'player_id', type: 'text', label: 'Player ID', label_bn: 'Player ID', required: true },
                      { id: 'whatsapp', type: 'tel', label: 'WhatsApp Number', label_bn: 'WhatsApp', required: true }
                    ],
                    packages: []
                  })
                }
              >
                Add New Game
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
                        <span className="text-xs font-black text-white [html.light-theme_&]:text-slate-900">{game.name}</span>
                        <Badge color={game.badge_color}>{game.badge}</Badge>
                      </div>
                      <div className="text-[11px] text-gray-400 [html.light-theme_&]:text-slate-600 mt-0.5">
                        Packages: {game.packages.length} | Delivery: {game.delivery_time} | Type: {game.product_type}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button variant="glass" size="sm" icon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => setEditingGame({ ...game })}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => handleDeleteGame(game.id)} />
                  </div>
                </Card>
              ))}
            </div>

            {/* Game Edit Modal */}
            <Modal isOpen={Boolean(editingGame)} onClose={() => setEditingGame(null)} title="Edit Game Catalog">
              {editingGame && (
                <div className="space-y-3">
                  <Input
                    label="Game Title"
                    value={editingGame.name}
                    onChange={e => setEditingGame({ ...editingGame, name: e.target.value })}
                  />
                  <Input
                    label="URL Slug (lowercase-hyphenated)"
                    value={editingGame.slug}
                    onChange={e => setEditingGame({ ...editingGame, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  />
                  <ImageUploader
                    label="Game Poster Graphic (ImgBB Upload)"
                    value={editingGame.poster}
                    onChange={url => setEditingGame({ ...editingGame, poster: url })}
                    aspect="aspect-[3/4]"
                    hint="Upload high-res game poster directly to ImgBB CDN"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Badge Label"
                      value={editingGame.badge}
                      onChange={e => setEditingGame({ ...editingGame, badge: e.target.value })}
                    />
                    <Input
                      label="Delivery Time Window"
                      value={editingGame.delivery_time}
                      onChange={e => setEditingGame({ ...editingGame, delivery_time: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                    <Button variant="ghost" size="sm" onClick={() => setEditingGame(null)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleSaveGame(editingGame)}>
                      Save Game
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
                <h2 className="text-xl font-black text-white [html.light-theme_&]:text-slate-900">Packages & Prices Management</h2>
                <p className="text-xs text-gray-400 [html.light-theme_&]:text-slate-600">Select game to add, edit pricing, or toggle stock availability</p>
              </div>

              <select
                value={selectedGameId}
                onChange={e => setSelectedGameId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/10 [html.light-theme_&]:bg-black/5 border border-white/15 [html.light-theme_&]:border-black/15 text-xs text-white [html.light-theme_&]:text-slate-900 font-bold"
              >
                {storeData.games.map(g => (
                  <option key={g.id} value={g.id} className="bg-black text-white">
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
                    <span className="text-xs text-gray-400 [html.light-theme_&]:text-slate-600 font-bold">
                      {game.packages.length} Packages configured for {game.name}
                    </span>
                    <Button
                      variant="primary"
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
                      Add Package
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
                          <div className="text-xs font-bold text-white [html.light-theme_&]:text-slate-900 flex items-center gap-1.5">
                            <span>{pkg.icon || '🪙'}</span> {pkg.name}
                          </div>
                          <div className="text-sm font-extrabold text-emerald-400 mt-0.5">
                            {formatCurrency(pkg.price)}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSavePackage(game.id, { ...pkg, stock: !pkg.stock })}
                            className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer ${
                              pkg.stock
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-red-500/20 hover:text-red-400'
                                : 'bg-red-500/20 text-red-400 hover:bg-emerald-500/20 hover:text-emerald-400'
                            }`}
                          >
                            {pkg.stock ? '🟢 In Stock (Click to toggle)' : '🔴 Out of Stock'}
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

            {/* Package Edit Modal with Fixed Number Input (0 Can Be Deleted) */}
            <Modal isOpen={Boolean(editingPackage)} onClose={() => setEditingPackage(null)} title="Edit Package">
              {editingPackage && (
                <div className="space-y-3">
                  <Input
                    label="Package Title"
                    value={editingPackage.pkg.name}
                    onChange={e =>
                      setEditingPackage({
                        ...editingPackage,
                        pkg: { ...editingPackage.pkg, name: e.target.value }
                      })
                    }
                  />
                  <Input
                    label="Price (BDT)"
                    type="number"
                    value={editingPackage.pkg.price === 0 ? '' : editingPackage.pkg.price}
                    placeholder="0"
                    onChange={e =>
                      setEditingPackage({
                        ...editingPackage,
                        pkg: { ...editingPackage.pkg, price: e.target.value === '' ? 0 : Number(e.target.value) }
                      })
                    }
                  />
                  <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                    <Button variant="ghost" size="sm" onClick={() => setEditingPackage(null)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleSavePackage(editingPackage.gameId, editingPackage.pkg)}>
                      Save Package
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
                <h2 className="text-xl font-black text-white [html.light-theme_&]:text-slate-900">Discount Coupons & Vouchers</h2>
                <p className="text-xs text-gray-400 [html.light-theme_&]:text-slate-600">Create promo codes, set instant discounts, and toggle voucher active status</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() =>
                  setEditingCoupon({
                    id: `cpn-${Date.now()}`,
                    code: 'DISCOUNT',
                    discount: 25,
                    minSpend: 200,
                    description: 'Get instant BDT 25 discount on orders over BDT 200',
                    colorClass: 'coupon-red',
                    active: true
                  })
                }
              >
                Add New Coupon
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
                      <span className="text-xs font-mono font-black text-white [html.light-theme_&]:text-slate-900 bg-white/10 [html.light-theme_&]:bg-black/10 px-2 py-0.5 rounded-md">
                        {coupon.code}
                      </span>
                      <span className="text-xs font-extrabold text-emerald-400">{formatCurrency(coupon.discount)} OFF</span>
                    </div>
                    <p className="text-xs text-gray-300 [html.light-theme_&]:text-slate-600 mt-2">{coupon.description}</p>
                    <div className="text-[10px] text-gray-400 mt-1">Min Spend: {formatCurrency(coupon.minSpend)}</div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSaveCoupon({ ...coupon, active: !coupon.active })}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer ${
                        coupon.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {coupon.active ? 'Active' : 'Inactive'}
                    </button>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" icon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => setEditingCoupon({ ...coupon })} />
                      <Button variant="danger" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => handleDeleteCoupon(coupon.id)} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Coupon Edit Modal with Fixed Number Inputs */}
            <Modal isOpen={Boolean(editingCoupon)} onClose={() => setEditingCoupon(null)} title="Edit Coupon">
              {editingCoupon && (
                <div className="space-y-3">
                  <Input
                    label="Coupon Code (UPPERCASE)"
                    value={editingCoupon.code}
                    onChange={e => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                    className="uppercase font-mono"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Discount Amount (BDT)"
                      type="number"
                      value={editingCoupon.discount === 0 ? '' : editingCoupon.discount}
                      placeholder="0"
                      onChange={e => setEditingCoupon({ ...editingCoupon, discount: e.target.value === '' ? 0 : Number(e.target.value) })}
                    />
                    <Input
                      label="Minimum Spend (BDT)"
                      type="number"
                      value={editingCoupon.minSpend === 0 ? '' : editingCoupon.minSpend}
                      placeholder="0"
                      onChange={e => setEditingCoupon({ ...editingCoupon, minSpend: e.target.value === '' ? 0 : Number(e.target.value) })}
                    />
                  </div>
                  <Input
                    label="Description / Voucher Terms"
                    value={editingCoupon.description}
                    onChange={e => setEditingCoupon({ ...editingCoupon, description: e.target.value })}
                  />
                  <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                    <Button variant="ghost" size="sm" onClick={() => setEditingCoupon(null)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleSaveCoupon(editingCoupon)}>
                      Save Coupon
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
                <h2 className="text-xl font-black text-white [html.light-theme_&]:text-slate-900">Live Orders Hub & Delivery</h2>
                <p className="text-xs text-gray-400 [html.light-theme_&]:text-slate-600">Review player details, payment last 4 digits, and update order statuses</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Search by Order ID, phone or digits..."
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white [html.light-theme_&]:text-slate-900 [html.light-theme_&]:bg-black/5"
                />
                <select
                  value={orderFilter}
                  onChange={e => setOrderFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 [html.light-theme_&]:bg-black/5 border border-white/15 [html.light-theme_&]:border-black/15 text-xs text-white [html.light-theme_&]:text-slate-900 font-bold"
                >
                  <option value="all" className="bg-black text-white">All Orders</option>
                  <option value="Pending" className="bg-black text-white">Pending ⏳</option>
                  <option value="Processing" className="bg-black text-white">Processing ⚙️</option>
                  <option value="Completed" className="bg-black text-white">Completed ✅</option>
                  <option value="Cancelled" className="bg-black text-white">Cancelled ❌</option>
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
                    o.customData?.whatsapp?.includes(orderSearch) ||
                    o.customData?.player_id?.includes(orderSearch);
                  const matchFilter = orderFilter === 'all' || o.status === orderFilter;
                  return matchSearch && matchFilter;
                })
                .map(order => (
                  <Card key={order.id} variant="glass" className="p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-white [html.light-theme_&]:text-slate-900 bg-white/10 [html.light-theme_&]:bg-black/10 px-2 py-0.5 rounded-md">
                          {order.id}
                        </span>
                        <span className="text-xs font-bold text-gray-300 [html.light-theme_&]:text-slate-700">• {order.gameName}</span>
                        <span className="text-xs font-extrabold text-emerald-400">{formatCurrency(order.totalAmount)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 [html.light-theme_&]:text-slate-600 font-bold">Status:</span>
                        <select
                          value={order.status}
                          onChange={e => handleUpdateOrderStatus(order.id, e.target.value as any)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                            order.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : order.status === 'Pending'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          <option value="Pending" className="bg-black text-white">Pending ⏳</option>
                          <option value="Processing" className="bg-black text-white">Processing ⚙️</option>
                          <option value="Completed" className="bg-black text-white">Completed ✅</option>
                          <option value="Cancelled" className="bg-black text-white">Cancelled ❌</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-300 [html.light-theme_&]:text-slate-700">
                      <div>
                        <span className="text-gray-400 [html.light-theme_&]:text-slate-500">Packages:</span>{' '}
                        <strong>{order.packages.map(p => p.name).join(', ')}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 [html.light-theme_&]:text-slate-500">Payment:</span>{' '}
                        <strong>{order.paymentMethod} (Last 4 Digits: {order.senderLastDigits})</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 [html.light-theme_&]:text-slate-500">Timestamp:</span> {order.date}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 [html.light-theme_&]:bg-slate-100 border border-white/5 [html.light-theme_&]:border-black/10 text-xs flex flex-wrap gap-4 text-gray-300 [html.light-theme_&]:text-slate-800">
                      {Object.entries(order.customData).map(([k, v]) => (
                        <div key={k}>
                          <span className="text-gray-400 [html.light-theme_&]:text-slate-500 capitalize">{k.replace('_', ' ')}:</span>{' '}
                          <span className="font-mono text-white [html.light-theme_&]:text-slate-900 font-bold">{v}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* USERS & ROLES TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white [html.light-theme_&]:text-slate-900">User & Access Management (RBAC)</h2>
                <p className="text-xs text-gray-400 [html.light-theme_&]:text-slate-600">Control gamer accounts, assign Super Admin privileges, and adjust wallet balances</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users or roles..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white [html.light-theme_&]:text-slate-900 [html.light-theme_&]:bg-black/5"
                  />
                </div>
              </div>
            </div>

            {/* Quick KPI Stats for Users */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card variant="glass" className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400 [html.light-theme_&]:text-slate-600 font-bold">Total Registered Users</div>
                  <div className="text-2xl font-black text-white [html.light-theme_&]:text-slate-900 mt-1">{(storeData.users || []).length}</div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Users className="w-5 h-5" />
                </div>
              </Card>
              <Card variant="glass" className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400 [html.light-theme_&]:text-slate-600 font-bold">Super Admins</div>
                  <div className="text-2xl font-black text-white [html.light-theme_&]:text-slate-900 mt-1">
                    {(storeData.users || []).filter(u => u.role === 'admin').length}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <Crown className="w-5 h-5" />
                </div>
              </Card>
              <Card variant="glass" className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400 [html.light-theme_&]:text-slate-600 font-bold">Standard Gamers</div>
                  <div className="text-2xl font-black text-white [html.light-theme_&]:text-slate-900 mt-1">
                    {(storeData.users || []).filter(u => u.role !== 'admin').length}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <User className="w-5 h-5" />
                </div>
              </Card>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(storeData.users || [])
                .filter(u =>
                  !userSearch ||
                  u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                  (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
                  (u.phone && u.phone.includes(userSearch)) ||
                  u.role.toLowerCase().includes(userSearch.toLowerCase())
                )
                .map(targetUser => {
                  const isTargetAdmin = targetUser.role === 'admin';
                  return (
                    <Card
                      key={targetUser.id}
                      variant="glass"
                      className="p-4 flex flex-col justify-between space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0 ${
                            isTargetAdmin
                              ? 'bg-rose-600 shadow-md shadow-rose-950/40'
                              : 'bg-white/10 [html.light-theme_&]:bg-black/10 text-white [html.light-theme_&]:text-slate-800'
                          }`}>
                            {isTargetAdmin ? <Crown className="w-5 h-5 text-white" /> : targetUser.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-white [html.light-theme_&]:text-slate-900 text-sm truncate">
                              {targetUser.name}
                            </h4>
                            <p className="text-[11px] text-gray-400 [html.light-theme_&]:text-slate-500 truncate">
                              {targetUser.email || targetUser.phone || 'No email/phone'}
                            </p>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                          isTargetAdmin
                            ? 'bg-rose-600/20 text-rose-400 [html.light-theme_&]:text-rose-600 border border-rose-500/40'
                            : 'bg-white/10 [html.light-theme_&]:bg-black/5 text-gray-300 [html.light-theme_&]:text-slate-700'
                        }`}>
                          {isTargetAdmin ? <Crown className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
                          {targetUser.role}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10 [html.light-theme_&]:border-black/10">
                        <div className="text-gray-400 [html.light-theme_&]:text-slate-600">
                          Wallet Balance: <span className="font-extrabold text-emerald-400">BDT {targetUser.walletBalance || 0}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit2 className="w-3.5 h-3.5" />}
                          onClick={() => setEditingUser({ ...targetUser })}
                        >
                          Edit Role
                        </Button>
                      </div>
                    </Card>
                  );
                })}
            </div>

            {/* Edit User Modal with Fixed Number Input */}
            <Modal isOpen={Boolean(editingUser)} onClose={() => setEditingUser(null)} title="Edit User Role & Wallet Balance">
              {editingUser && (
                <div className="space-y-4">
                  <Input
                    label="User Full Name"
                    value={editingUser.name}
                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Email Address"
                      type="email"
                      value={editingUser.email || ''}
                      onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                    />
                    <Input
                      label="Phone Number"
                      value={editingUser.phone || ''}
                      onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300 [html.light-theme_&]:text-slate-800">
                      System Role / Privileges *
                    </label>
                    <select
                      value={editingUser.role}
                      onChange={e => setEditingUser({ ...editingUser, role: e.target.value as 'user' | 'admin' })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 [html.light-theme_&]:bg-black/5 border border-white/15 [html.light-theme_&]:border-black/15 text-xs text-white [html.light-theme_&]:text-slate-900 font-bold focus:outline-none focus:border-rose-500"
                    >
                      <option value="user" className="bg-[#0b172a] text-white">Regular Gamer (User)</option>
                      <option value="admin" className="bg-[#0b172a] text-white">👑 Super Admin (Full Control Center Access)</option>
                    </select>
                    <p className="text-[10px] text-gray-400">
                      Granting Admin privilege authorizes this account to manage all database records and CMS content.
                    </p>
                  </div>

                  <Input
                    label="Wallet Balance (BDT)"
                    type="number"
                    value={editingUser.walletBalance === 0 ? '' : editingUser.walletBalance}
                    placeholder="0"
                    onChange={e => setEditingUser({ ...editingUser, walletBalance: e.target.value === '' ? 0 : Number(e.target.value) })}
                  />

                  <div className="flex justify-end gap-2 pt-3 border-t border-white/10 [html.light-theme_&]:border-black/10">
                    <Button variant="ghost" size="sm" onClick={() => setEditingUser(null)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleSaveUser(editingUser)}>
                      Save & Update Role
                    </Button>
                  </div>
                </div>
              )}
            </Modal>
          </div>
        )}

        {/* AUDIT HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white [html.light-theme_&]:text-slate-900">Audit History Trail</h2>
                <p className="text-xs text-gray-400 [html.light-theme_&]:text-slate-600">Immutable record of administrative actions, edits, status updates, and deletions</p>
              </div>

              <input
                type="text"
                placeholder="Search audit history..."
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white [html.light-theme_&]:text-slate-900 [html.light-theme_&]:bg-black/5"
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
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {log.action}
                        </span>
                        <strong className="text-white [html.light-theme_&]:text-slate-900">{log.entity}</strong>
                        <span className="text-gray-400">• {log.author}</span>
                      </div>
                      <p className="text-gray-300 [html.light-theme_&]:text-slate-600 mt-1">{log.details}</p>
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
              <h2 className="text-xl font-black text-white [html.light-theme_&]:text-slate-900">Admin Security & Infrastructure</h2>
              <p className="text-xs text-gray-400 [html.light-theme_&]:text-slate-600">Role-based privileges, authentication session, and database connectivity</p>
            </div>

            <Card variant="glass" className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black text-white [html.light-theme_&]:text-slate-900">
                  Role-Based Access Control (RBAC)
                </h3>
              </div>
              <p className="text-xs text-gray-300 [html.light-theme_&]:text-slate-600 leading-relaxed">
                Manual PIN prompt has been eliminated. Administrative privileges are authenticated securely via verified Google or Email credentials.
              </p>
              <div className="p-3 rounded-xl bg-white/5 [html.light-theme_&]:bg-black/5 border border-white/10 [html.light-theme_&]:border-black/10 flex items-center justify-between text-xs">
                <span className="text-gray-400 [html.light-theme_&]:text-slate-600">Authenticated As:</span>
                <span className="font-extrabold text-emerald-400 [html.light-theme_&]:text-emerald-700">
                  {user?.email || user?.name || 'Administrator'} (Role: {user?.role || 'admin'})
                </span>
              </div>
            </Card>

            <Card variant="glass" className="p-5 space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">System Connectivity</h3>
              <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                <span>Database Engine:</span>
                <span className="font-bold text-emerald-400">MongoDB Atlas Cloud (cluster0.edizqnd.mongodb.net)</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                <span>Image Storage CDN:</span>
                <span className="font-bold text-rose-400">ImgBB Direct Multipart API</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span>Authentication Provider:</span>
                <span className="font-bold text-cyan-400">Firebase Auth & Google OAuth</span>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

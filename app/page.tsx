'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/storefront/Navbar';
import HeroBanner from '@/components/storefront/HeroBanner';
import TrustBadges from '@/components/storefront/TrustBadges';
import GameCatalog from '@/components/storefront/GameCatalog';
import TopUpSection from '@/components/storefront/TopUpSection';
import CouponsSection from '@/components/storefront/CouponsSection';
import OrdersSection from '@/components/storefront/OrdersSection';
import AccountSection from '@/components/storefront/AccountSection';
import BottomDock from '@/components/storefront/BottomDock';
import InvoiceModal from '@/components/storefront/InvoiceModal';
import FloatingToast, { ToastMessage } from '@/components/storefront/FloatingToast';
import { GameItem, PackageItem, SiteSettings, CouponItem, OrderItem, TrustBadge } from '@/lib/types';
import { RefreshCw } from 'lucide-react';

export default function HomePage() {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Navigation tab for mobile / desktop sections
  const [activeTab, setActiveTab] = useState<'home' | 'codes' | 'orders' | 'account'>('home');

  // Store data
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [trustBadges, setTrustBadges] = useState<TrustBadge[]>([]);
  const [games, setGames] = useState<GameItem[]>([]);
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active game selection
  const [selectedGameId, setSelectedGameId] = useState<string>('efootball');

  // Active coupon applied
  const [appliedCoupon, setAppliedCoupon] = useState<CouponItem | null>(null);

  // Invoice modal
  const [viewingOrder, setViewingOrder] = useState<OrderItem | null>(null);

  // Floating toast notification
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    fetchSiteData();
    fetchOrders();

    // Check saved theme
    const savedTheme = localStorage.getItem('sonic_theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.className = `${savedTheme}-theme`;
    }
  }, []);

  const fetchSiteData = async () => {
    try {
      const res = await fetch('/api/site-data');
      const json = await res.json();
      if (json.success) {
        setSettings(json.data.settings);
        setTrustBadges(json.data.trustBadges);
        setGames(json.data.games);
        setCoupons(json.data.coupons);
        if (json.data.games.length > 0 && !selectedGameId) {
          setSelectedGameId(json.data.games[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load site data:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success) {
        setOrders(json.orders || []);
      }
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    }
  };

  // Toggle Theme
  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('sonic_theme', next);
    document.documentElement.className = `${next}-theme`;
  };

  // Show Toast Helper
  const showToast = (title: string, desc: string, icon: string = '✓') => {
    setToast({ id: String(Date.now()), title, desc, icon });
  };

  // Apply Coupon Helper
  const handleApplyCoupon = (code: string) => {
    const normalized = (code || '').trim().toUpperCase();
    const match = coupons.find(c => c.code.toUpperCase() === normalized && c.active);
    if (match) {
      setAppliedCoupon(match);
      showToast('কুপন সক্রিয় হয়েছে!', `🎉 ${match.code} কোড প্রয়োগে ৳${match.discount} ক্যাশ ডিসকাউন্ট যোগ করা হয়েছে!`, '🎟️');
    } else {
      showToast('ভুল কুপন কোড', 'এই কুপনটি সঠিক নয় অথবা মেয়াদ শেষ হয়ে গেছে!', '⚠️');
    }
  };

  // Handle Order Placed
  const handleOrderPlaced = (newOrder: OrderItem) => {
    setOrders([newOrder, ...orders]);
    setViewingOrder(newOrder);
    showToast('অর্ডার সফল হয়েছে!', `অর্ডার আইডি #${newOrder.id} গ্রহণ করা হয়েছে।`, '🚚');
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-[#080a0f] flex flex-col items-center justify-center text-white text-sm">
        <RefreshCw className="w-6 h-6 animate-spin text-red-500 mb-2" />
        <span>Sonic's E-Shop লোড হচ্ছে...</span>
      </div>
    );
  }

  const selectedGame = games.find(g => g.id === selectedGameId) || games[0];

  return (
    <div className="min-h-screen flex flex-col justify-between pb-20 sm:pb-8">
      {/* Navbar with Live Search & Theme Switcher */}
      <Navbar
        settings={settings}
        games={games}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onSelectGame={id => {
          setSelectedGameId(id);
          setActiveTab('home');
        }}
        onSelectPackage={(gameId, pkg) => {
          setSelectedGameId(gameId);
          setActiveTab('home');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-10">
        {/* Tab 1: Home Shop View */}
        {activeTab === 'home' && (
          <>
            <HeroBanner settings={settings} />
            <TrustBadges badges={trustBadges} />

            {/* Game Catalog 3D Cards */}
            <GameCatalog
              games={games}
              selectedGameId={selectedGameId}
              onSelectGame={id => setSelectedGameId(id)}
            />

            {/* Dynamic Top-Up Section */}
            {selectedGame && (
              <TopUpSection
                game={selectedGame}
                settings={settings}
                coupons={coupons}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={handleApplyCoupon}
                onShowToast={showToast}
                onOrderPlaced={handleOrderPlaced}
              />
            )}

            {/* Redeem Codes & Coupons Section */}
            <CouponsSection
              coupons={coupons}
              onApplyCoupon={handleApplyCoupon}
              onShowToast={showToast}
            />

            {/* Orders Section Preview */}
            <OrdersSection
              orders={orders}
              onViewInvoice={order => setViewingOrder(order)}
            />
          </>
        )}

        {/* Tab 2: Dedicated Coupons / Offers View */}
        {activeTab === 'codes' && (
          <div className="pt-4">
            <CouponsSection
              coupons={coupons}
              onApplyCoupon={handleApplyCoupon}
              onShowToast={showToast}
            />
          </div>
        )}

        {/* Tab 3: Dedicated Orders Tracking View */}
        {activeTab === 'orders' && (
          <div className="pt-4">
            <OrdersSection
              orders={orders}
              onViewInvoice={order => setViewingOrder(order)}
            />
          </div>
        )}

        {/* Tab 4: Account & Retro Lamp Login View */}
        {activeTab === 'account' && (
          <div className="pt-4">
            <AccountSection />
          </div>
        )}
      </main>

      {/* Footer Section */}
      <footer className="border-t border-white/10 glass-panel py-6 text-center text-xs text-gray-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="font-bold text-gray-300">© 2026 {settings.siteName}. All Rights Reserved.</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Automated Top-Up Solution with Next.js 16, MongoDB & Firebase</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <a href={settings.whatsappUrl} target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">
              হোয়াটসঅ্যাপ
            </a>
            <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">
              ফেসবুক পেজ
            </a>
            <a href="/admin" className="text-red-400 hover:text-red-300">
              অ্যাডমিন পোর্টাল
            </a>
          </div>
        </div>
      </footer>

      {/* Floating Mobile Bottom Navigation Dock */}
      <BottomDock
        activeTab={activeTab}
        onSelectTab={tab => setActiveTab(tab)}
      />

      {/* Printable Digital Invoice Receipt Modal */}
      <InvoiceModal
        order={viewingOrder}
        settings={settings}
        onClose={() => setViewingOrder(null)}
      />

      {/* Floating Glass Toast Notification */}
      <FloatingToast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

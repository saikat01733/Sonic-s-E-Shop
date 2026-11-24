'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Palette,
  Flame,
  ShieldCheck,
  Gamepad2,
  Package,
  Tag,
  ShoppingBag,
  History,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

export type AdminTab =
  | 'dashboard'
  | 'site_cms'
  | 'hero_slides'
  | 'trust_badges'
  | 'games'
  | 'packages'
  | 'coupons'
  | 'orders'
  | 'history'
  | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingOrdersCount: number;
  onLogout: () => void;
}

export function AdminSidebar({
  activeTab,
  onSelectTab,
  pendingOrdersCount,
  onLogout,
}: AdminSidebarProps) {
  const { t } = useLanguage();

  const menuItems: { id: AdminTab; label: string; icon: any; badge?: number }[] = [
    { id: 'dashboard', label: 'Overview & KPIs', icon: LayoutDashboard },
    { id: 'site_cms', label: 'Site Branding & Info', icon: Palette },
    { id: 'hero_slides', label: 'Hero Carousel Slides', icon: Flame },
    { id: 'trust_badges', label: 'Trust Badges & Perks', icon: ShieldCheck },
    { id: 'games', label: 'Game Catalog (CRUD)', icon: Gamepad2 },
    { id: 'packages', label: 'Packages & Prices', icon: Package },
    { id: 'coupons', label: 'Discount Coupons', icon: Tag },
    { id: 'orders', label: 'Live Orders Hub', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'history', label: 'Audit History Logs', icon: History },
    { id: 'settings', label: 'Admin Security', icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 liquid-glass bg-white/[0.08] border border-white/20 flex flex-col justify-between flex-shrink-0 rounded-3xl p-2 shadow-2xl backdrop-blur-3xl">
      <div>
        <div className="p-3 border-b border-white/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-[oklch(45.5%_0.188_13.697)] flex items-center justify-center text-white font-black text-sm shadow-lg shadow-[oklch(45.5%_0.188_13.697_/_0.35)]">
              ⚡
            </div>
            <div>
              <h1 className="text-sm font-black text-white">Sonic CMS</h1>
              <div className="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Cloud Sync
              </div>
            </div>
          </div>
          <Link
            href="/"
            target="_blank"
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
            title="View Live Store"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <nav className="p-2 space-y-1 overflow-x-auto md:overflow-visible flex md:flex-col gap-1 md:gap-0">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/35 scale-102'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="px-2 py-0.5 rounded-full bg-[oklch(45.5%_0.188_13.697)] text-white font-extrabold text-[10px] shadow-sm">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-2 border-t border-white/15">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-white/10 hover:bg-red-500/25 text-gray-300 hover:text-red-300 text-xs font-bold transition-all cursor-pointer border border-white/10"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}

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
  Users,
  X,
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'site_cms'
  | 'hero_slides'
  | 'trust_badges'
  | 'games'
  | 'packages'
  | 'coupons'
  | 'orders'
  | 'users'
  | 'history'
  | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingOrdersCount: number;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({
  activeTab,
  onSelectTab,
  pendingOrdersCount,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
}: AdminSidebarProps) {
  const menuItems: { id: AdminTab; label: string; icon: any; badge?: number }[] = [
    { id: 'dashboard', label: 'Overview & KPIs', icon: LayoutDashboard },
    { id: 'site_cms', label: 'Site Branding & Info', icon: Palette },
    { id: 'hero_slides', label: 'Hero Carousel Slides', icon: Flame },
    { id: 'trust_badges', label: 'Trust Badges & Perks', icon: ShieldCheck },
    { id: 'games', label: 'Game Catalog (CRUD)', icon: Gamepad2 },
    { id: 'packages', label: 'Packages & Prices', icon: Package },
    { id: 'coupons', label: 'Discount Coupons', icon: Tag },
    { id: 'orders', label: 'Live Orders Hub', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'users', label: 'Users & Roles (RBAC)', icon: Users },
    { id: 'history', label: 'Audit History Logs', icon: History },
    { id: 'settings', label: 'Admin Security', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="p-3 border-b border-white/15 [html.light-theme_&]:border-black/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-rose-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-rose-950/40">
              ⚡
            </div>
            <div>
              <h1 className="text-sm font-black text-white [html.light-theme_&]:text-slate-900">Sonic CMS</h1>
              <div className="text-[10px] text-emerald-400 [html.light-theme_&]:text-emerald-700 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Cloud Sync
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/"
              target="_blank"
              className="p-1.5 rounded-xl bg-white/10 [html.light-theme_&]:bg-black/5 hover:bg-white/20 text-gray-300 [html.light-theme_&]:text-slate-700 hover:text-white [html.light-theme_&]:hover:text-black transition-colors"
              title="View Live Store"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="md:hidden p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <nav className="p-2 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/40 border border-rose-500/40'
                    : 'text-gray-300 [html.light-theme_&]:text-slate-700 hover:text-white [html.light-theme_&]:hover:text-black hover:bg-white/10 [html.light-theme_&]:hover:bg-black/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-sm">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-2 border-t border-white/10 [html.light-theme_&]:border-black/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 liquid-glass bg-white/[0.08] [html.light-theme_&]:bg-white/90 border border-white/20 [html.light-theme_&]:border-black/10 flex-col justify-between flex-shrink-0 rounded-3xl p-2 shadow-2xl backdrop-blur-3xl sticky top-4 max-h-[calc(100vh-2rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Slide-over */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full bg-[#081528] border-r border-white/20 p-2 shadow-2xl z-10 flex flex-col justify-between">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

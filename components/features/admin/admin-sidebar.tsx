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
  const cmsItems: { id: AdminTab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Overview & KPIs', icon: LayoutDashboard },
    { id: 'site_cms', label: 'Site Branding & Info', icon: Palette },
    { id: 'hero_slides', label: 'Hero Carousel Slides', icon: Flame },
    { id: 'trust_badges', label: 'Trust Badges & Perks', icon: ShieldCheck },
    { id: 'games', label: 'Game Catalog (CRUD)', icon: Gamepad2 },
    { id: 'packages', label: 'Packages & Prices', icon: Package },
    { id: 'coupons', label: 'Discount Coupons', icon: Tag },
  ];

  const opsItems: { id: AdminTab; label: string; icon: any; badge?: number }[] = [
    { id: 'orders', label: 'Live Orders Hub', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'users', label: 'Users & Roles (RBAC)', icon: Users },
    { id: 'history', label: 'Audit History Logs', icon: History },
    { id: 'settings', label: 'Admin Security', icon: Settings },
  ];

  const renderNavItem = (item: { id: AdminTab; label: string; icon: any; badge?: number }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => {
          onSelectTab(item.id);
          if (onCloseMobile) onCloseMobile();
        }}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
          isActive
            ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/40 border border-rose-500/40'
            : 'text-gray-300 [html.light-theme_&]:text-slate-700 hover:text-white [html.light-theme_&]:hover:text-slate-950 hover:bg-white/[0.08] [html.light-theme_&]:hover:bg-slate-200/70'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 [html.light-theme_&]:text-slate-500'}`} />
          <span className="truncate">{item.label}</span>
        </div>
        {typeof item.badge === 'number' && item.badge > 0 && (
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black shadow-sm flex-shrink-0 ${
            isActive ? 'bg-white text-rose-600' : 'bg-rose-600 text-white'
          }`}>
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="p-3.5 border-b border-white/10 [html.light-theme_&]:border-slate-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-rose-950/40 flex-shrink-0">
            ⚡
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-black text-white [html.light-theme_&]:text-slate-900 truncate">Sonic CMS</h1>
            <div className="text-[10px] text-emerald-400 [html.light-theme_&]:text-emerald-700 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="truncate">Live Cloud Sync</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Link
            href="/"
            target="_blank"
            className="p-2 rounded-xl bg-white/[0.07] [html.light-theme_&]:bg-slate-100 hover:bg-white/15 [html.light-theme_&]:hover:bg-slate-200 text-gray-300 [html.light-theme_&]:text-slate-700 hover:text-white [html.light-theme_&]:hover:text-black transition-colors"
            title="View Live Store"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-2 rounded-xl bg-white/10 [html.light-theme_&]:bg-slate-100 hover:bg-white/20 text-gray-300 [html.light-theme_&]:text-slate-700 cursor-pointer"
              aria-label="Close Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Menu List */}
      <nav className="flex-1 overflow-y-auto p-2.5 space-y-4 min-h-0">
        <div className="space-y-1">
          <div className="px-3 pb-1 text-[10px] font-black uppercase tracking-widest text-gray-500 [html.light-theme_&]:text-slate-400">
            Store & Catalog
          </div>
          {cmsItems.map(renderNavItem)}
        </div>

        <div className="space-y-1 pt-2 border-t border-white/10 [html.light-theme_&]:border-slate-200">
          <div className="px-3 pb-1 text-[10px] font-black uppercase tracking-widest text-gray-500 [html.light-theme_&]:text-slate-400">
            Operations & RBAC
          </div>
          {opsItems.map(renderNavItem)}
        </div>
      </nav>

      {/* Pinned Sign Out Footer */}
      <div className="p-2.5 border-t border-white/10 [html.light-theme_&]:border-slate-200 flex-shrink-0">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-extrabold text-red-400 [html.light-theme_&]:text-red-600 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar (Never clips Sign Out) */}
      <aside className="hidden lg:flex w-64 h-[calc(100vh-2rem)] sticky top-4 flex-col flex-shrink-0 rounded-3xl bg-[#0a101f]/90 [html.light-theme_&]:bg-white/95 border border-white/15 [html.light-theme_&]:border-slate-200 shadow-2xl backdrop-blur-2xl overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile & Tablet Slide-over Drawer (320px - 1023px) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[120] lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full bg-[#0a101f] [html.light-theme_&]:bg-white border-r border-white/15 [html.light-theme_&]:border-slate-200 shadow-2xl z-10 flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

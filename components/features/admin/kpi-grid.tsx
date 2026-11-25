import React from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Wallet, Clock, Gamepad2, Tag } from 'lucide-react';

interface KpiGridProps {
  totalRevenue: number;
  completedOrdersCount: number;
  pendingOrdersCount: number;
  activeGamesCount: number;
  activeCouponsCount: number;
  totalCouponsCount: number;
}

export function KpiGrid({
  totalRevenue,
  completedOrdersCount,
  pendingOrdersCount,
  activeGamesCount,
  activeCouponsCount,
  totalCouponsCount,
}: KpiGridProps) {
  const stats = [
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      sub: `${completedOrdersCount} Completed / Delivered`,
      icon: Wallet,
      color: 'text-emerald-400 [html.light-theme_&]:text-emerald-700',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 [html.light-theme_&]:text-emerald-600',
    },
    {
      label: 'Pending Orders',
      value: String(pendingOrdersCount),
      sub: pendingOrdersCount > 0 ? 'Requires Attention' : 'All Caught Up',
      icon: Clock,
      color: 'text-rose-400 [html.light-theme_&]:text-rose-600',
      iconBg: 'bg-rose-500/15 border-rose-500/30 text-rose-400 [html.light-theme_&]:text-rose-600',
    },
    {
      label: 'Active Games',
      value: String(activeGamesCount),
      sub: 'Live Top-Up Catalog',
      icon: Gamepad2,
      color: 'text-cyan-400 [html.light-theme_&]:text-cyan-700',
      iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400 [html.light-theme_&]:text-cyan-600',
    },
    {
      label: 'Active Vouchers',
      value: String(activeCouponsCount),
      sub: `${totalCouponsCount} Total Configured`,
      icon: Tag,
      color: 'text-purple-400 [html.light-theme_&]:text-purple-700',
      iconBg: 'bg-purple-500/15 border-purple-500/30 text-purple-400 [html.light-theme_&]:text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      {stats.map(stat => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            variant="glass"
            className="p-4 sm:p-5 border-white/15 [html.light-theme_&]:border-slate-200/80 flex items-start justify-between gap-3"
          >
            <div className="min-w-0">
              <div className="text-xs text-gray-400 [html.light-theme_&]:text-slate-600 font-bold truncate">
                {stat.label}
              </div>
              <div className={`text-xl sm:text-2xl font-black mt-1 tracking-tight ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-[11px] text-gray-400 [html.light-theme_&]:text-slate-500 mt-1 truncate font-medium">
                {stat.sub}
              </div>
            </div>
            <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center flex-shrink-0 ${stat.iconBg}`}>
              <Icon className="w-5 h-5" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

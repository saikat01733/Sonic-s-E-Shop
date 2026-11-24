import React from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

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
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card variant="glass" className="p-5 border-white/20">
        <div className="text-xs text-gray-300 font-semibold">Total Revenue (Completed)</div>
        <div className="text-2xl font-black text-emerald-300 mt-1">{formatCurrency(totalRevenue)}</div>
        <div className="text-[10px] text-gray-400 mt-0.5">{completedOrdersCount} Delivered Orders</div>
      </Card>

      <Card variant="glass" className="p-5 border-white/20">
        <div className="text-xs text-gray-300 font-semibold">Pending Orders</div>
        <div className="text-2xl font-black text-cyan-300 mt-1">{pendingOrdersCount}</div>
        <div className="text-[10px] text-cyan-400 mt-0.5">Awaiting Processing</div>
      </Card>

      <Card variant="glass" className="p-5 border-white/20">
        <div className="text-xs text-gray-300 font-semibold">Active Games</div>
        <div className="text-2xl font-black text-cyan-300 mt-1">{activeGamesCount}</div>
        <div className="text-[10px] text-gray-400 mt-0.5">eFootball, PUBG, Roblox</div>
      </Card>

      <Card variant="glass" className="p-5 border-white/20">
        <div className="text-xs text-gray-300 font-semibold">Active Vouchers</div>
        <div className="text-2xl font-black text-purple-300 mt-1">{activeCouponsCount}</div>
        <div className="text-[10px] text-gray-400 mt-0.5">Total Coupons: {totalCouponsCount}</div>
      </Card>
    </div>
  );
}

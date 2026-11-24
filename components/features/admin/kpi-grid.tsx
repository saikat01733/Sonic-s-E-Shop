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
      <Card variant="glass" className="p-4 border border-white/10">
        <div className="text-xs text-gray-400 font-semibold">মোট আয় (Completed)</div>
        <div className="text-2xl font-black text-emerald-400 mt-1">{formatCurrency(totalRevenue)}</div>
        <div className="text-[10px] text-gray-500 mt-0.5">{completedOrdersCount} টি সম্পন্ন অর্ডার</div>
      </Card>

      <Card variant="glass" className="p-4 border border-white/10">
        <div className="text-xs text-gray-400 font-semibold">পেন্ডিং অর্ডারস</div>
        <div className="text-2xl font-black text-amber-400 mt-1">{pendingOrdersCount}</div>
        <div className="text-[10px] text-amber-500/80 mt-0.5">ডেলিভারির জন্য অপেক্ষারত</div>
      </Card>

      <Card variant="glass" className="p-4 border border-white/10">
        <div className="text-xs text-gray-400 font-semibold">সক্রিয় গেম ক্যাটালগ</div>
        <div className="text-2xl font-black text-cyan-400 mt-1">{activeGamesCount}</div>
        <div className="text-[10px] text-gray-500 mt-0.5">eFootball, PUBG, Roblox</div>
      </Card>

      <Card variant="glass" className="p-4 border border-white/10">
        <div className="text-xs text-gray-400 font-semibold">সক্রিয় কুপন কোড</div>
        <div className="text-2xl font-black text-purple-400 mt-1">{activeCouponsCount}</div>
        <div className="text-[10px] text-gray-500 mt-0.5">মোট কুপন {totalCouponsCount} টি</div>
      </Card>
    </div>
  );
}

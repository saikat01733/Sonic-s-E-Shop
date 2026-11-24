'use client';

import React, { useState } from 'react';
import { OrderItem } from '@/lib/types';
import { Package, Clock, CheckCircle2, XCircle, FileText, ExternalLink } from 'lucide-react';

interface OrdersSectionProps {
  orders: OrderItem[];
  onViewInvoice: (order: OrderItem) => void;
}

export default function OrdersSection({ orders, onViewInvoice }: OrdersSectionProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status.toLowerCase() === filterStatus.toLowerCase());

  const getStatusBadge = (status: OrderItem['status']) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" /> পেন্ডিং ⏳
          </span>
        );
      case 'Processing':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3 animate-spin" /> প্রসেসিং ⚙️
          </span>
        );
      case 'Completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> সম্পন্ন ✅
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> বাতিল ❌
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-cyan-400" />
            অর্ডার হিস্ট্রি ও ট্র্যাকিং (Order History)
          </h2>
          <p className="text-xs text-gray-400">আপনার সমস্ত টপ-আপ অর্ডারের লাইভ স্ট্যাটাস দেখুন</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['all', 'pending', 'processing', 'completed'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                filterStatus === st
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {st === 'all' ? 'সকল অর্ডার' : st}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="p-8 rounded-3xl glass-panel border border-white/10 text-center text-gray-400 text-xs">
          কোনো অর্ডার পাওয়া যায়নি!
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className="p-4 rounded-2xl glass-panel border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-black text-white bg-white/10 px-2 py-0.5 rounded-md">
                    {order.id}
                  </span>
                  <span className="text-xs font-bold text-gray-300">• {order.gameName}</span>
                  {getStatusBadge(order.status)}
                </div>

                <div className="text-xs text-gray-400">
                  প্যাকেজ: <strong className="text-gray-200">{order.packages.map(p => p.name).join(', ')}</strong> | মোট: <strong className="text-emerald-400">৳{order.totalAmount}</strong> ({order.paymentMethod})
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  তারিখ: {order.date}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onViewInvoice(order)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all flex-shrink-0"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>রসিদ / ইনভয়েস</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import InvoiceModal from '@/components/storefront/InvoiceModal';
import { OrderItem, SiteSettings, GameItem } from '@/lib/types';
import { Package, Search, Clock, CheckCircle2, XCircle, FileText, RefreshCw, ArrowLeft } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [games, setGames] = useState<GameItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingOrder, setViewingOrder] = useState<OrderItem | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/site-data').then(r => r.json()),
      fetch('/api/orders').then(r => r.json())
    ])
      .then(([siteJson, ordersJson]) => {
        if (siteJson.success) {
          setGames(siteJson.data.games);
          setSettings(siteJson.data.settings);
        }
        if (ordersJson.success) {
          setOrders(ordersJson.orders || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status.toLowerCase() === statusFilter.toLowerCase();
    const matchSearch =
      !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.senderLastDigits?.includes(search) ||
      o.customData?.whatsapp?.includes(search) ||
      o.gameName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getStatusBadge = (status: OrderItem['status']) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> পেন্ডিং ⏳
          </span>
        );
      case 'Processing':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 animate-spin" /> প্রসেসিং ⚙️
          </span>
        );
      case 'Completed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> সম্পন্ন ✅
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> বাতিল ❌
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar settings={settings || undefined} games={games} />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 mt-8 w-full">
        {/* Page Header */}
        <div className="liquid-glass p-6 sm:p-8 mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-bold text-xs mb-3">
              <Package className="w-3.5 h-3.5" />
              <span>অর্ডার ট্র্যাকিং সিস্টেম</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              আপনার সমস্ত টপ-আপ অর্ডারের লাইভ হিস্ট্রি
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
              আপনার অর্ডার আইডি (#SONIC-XXXXXX) অথবা ফোন নম্বর দিয়ে লাইভ ডেলিভারি স্ট্যাটাস চেক করুন এবং অফিশিয়াল ডিজিটাল ইনভয়েস দেখুন।
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
              {['all', 'pending', 'processing', 'completed'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-white/8 text-gray-300 hover:text-white hover:bg-white/15'
                  }`}
                >
                  {st === 'all' ? 'সকল অর্ডার' : st}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Order ID বা মোবাইল নম্বর..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/8 border border-white/10 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>
        </div>

        {/* Orders Listing */}
        {loading ? (
          <div className="py-20 text-center text-white text-xs flex flex-col items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-red-500 mb-2" />
            <span>অর্ডার ডাটা লোড হচ্ছে...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="liquid-glass p-12 text-center text-gray-400 text-sm">
            কোনো অর্ডার পাওয়া যায়নি!
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div
                key={order.id}
                className="liquid-glass p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-white/25"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-black text-white bg-white/10 px-2.5 py-1 rounded-lg">
                      {order.id}
                    </span>
                    <span className="text-xs font-bold text-white">• {order.gameName}</span>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="text-xs text-gray-300">
                    প্যাকেজ: <strong className="text-white">{order.packages.map(p => p.name).join(', ')}</strong> | মোট: <strong className="text-emerald-400">৳{order.totalAmount}</strong> ({order.paymentMethod})
                  </div>

                  <div className="text-[11px] text-gray-400">
                    অর্ডার তারিখ: {order.date}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setViewingOrder(order)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all flex-shrink-0"
                >
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>রসিদ / ইনভয়েস দেখুন</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer settings={settings || undefined} />

      {/* Invoice Receipt Modal */}
      <InvoiceModal
        order={viewingOrder}
        settings={settings}
        onClose={() => setViewingOrder(null)}
      />
    </div>
  );
}

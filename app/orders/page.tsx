'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import InvoiceModal from '@/components/common/InvoiceModal';
import { OrderCard } from '@/components/features/orders/order-card';
import { Card } from '@/components/ui/card';
import { useSiteData } from '@/hooks/use-site-data';
import { OrderItem } from '@/lib/types';
import { Package, Search, RefreshCw } from 'lucide-react';

export default function OrdersPage() {
  const { games, settings } = useSiteData();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingOrder, setViewingOrder] = useState<OrderItem | null>(null);

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(json => {
        if (json.success) setOrders(json.orders || []);
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

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar settings={settings} games={games} />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 mt-8 w-full">
        <Card variant="glass" className="p-6 sm:p-8 mb-8 relative overflow-hidden">
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

          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
              {['all', 'pending', 'processing', 'completed'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all whitespace-nowrap cursor-pointer ${
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
        </Card>

        {loading ? (
          <div className="py-20 text-center text-white text-xs flex flex-col items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-red-500 mb-2" />
            <span>অর্ডার ডাটা লোড হচ্ছে...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card variant="glass" className="p-12 text-center text-gray-400 text-sm">
            কোনো অর্ডার পাওয়া যায়নি!
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} onViewInvoice={setViewingOrder} />
            ))}
          </div>
        )}
      </main>

      <Footer settings={settings} />

      <InvoiceModal
        order={viewingOrder}
        settings={settings}
        onClose={() => setViewingOrder(null)}
      />
    </div>
  );
}

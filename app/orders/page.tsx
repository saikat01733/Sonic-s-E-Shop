'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import InvoiceModal from '@/components/common/InvoiceModal';
import { OrderCard } from '@/components/features/orders/order-card';
import { Card } from '@/components/ui/card';
import { useSiteData } from '@/hooks/use-site-data';
import { useLanguage } from '@/hooks/use-language';
import { OrderItem } from '@/lib/types';
import { Package, Search, RefreshCw } from 'lucide-react';

export default function OrdersPage() {
  const { games, settings } = useSiteData();
  const { t } = useLanguage();
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
        <Card variant="glass" className="p-6 sm:p-8 mb-8 relative overflow-hidden border-white/20">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/35 text-cyan-300 font-bold text-xs mb-3 backdrop-blur-md">
              <Package className="w-3.5 h-3.5" />
              <span>{t('navOrders')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              {t('orderTrackingTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
              {t('orderTrackingSubtitle')}
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
              {['all', 'pending', 'processing', 'completed'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all whitespace-nowrap cursor-pointer backdrop-blur-xl ${
                    statusFilter === st
                      ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/35'
                      : 'bg-white/[0.06] border border-white/15 text-gray-300 hover:text-white hover:bg-white/[0.12]'
                  }`}
                >
                  {st === 'all' ? 'All Orders' : st}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('searchOrderPlaceholder')}
                className="w-full pl-9 pr-3.5 py-2 rounded-2xl bg-white/[0.08] border border-white/20 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-cyan-500/70 backdrop-blur-xl"
              />
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="py-20 text-center text-white text-xs flex flex-col items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400 mb-2" />
            <span>Loading Orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm">
            {t('noResults')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onViewInvoice={ord => setViewingOrder(ord)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer settings={settings} />

      {viewingOrder && settings && (
        <InvoiceModal
          order={viewingOrder}
          settings={settings}
          onClose={() => setViewingOrder(null)}
        />
      )}
    </div>
  );
}

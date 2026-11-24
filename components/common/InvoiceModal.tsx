'use client';

import React from 'react';
import { OrderItem, SiteSettings } from '@/lib/types';
import { X, CheckCircle2, MessageCircle, Printer } from 'lucide-react';

interface InvoiceModalProps {
  order: OrderItem | null;
  settings: SiteSettings;
  onClose: () => void;
}

export default function InvoiceModal({ order, settings, onClose }: InvoiceModalProps) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppHelp = () => {
    const text = `হ্যালো, আমার অর্ডার #${order.id} (${order.gameName}) নিয়ে তথ্য জানতে চাচ্ছি।`;
    window.open(`https://wa.me/88${settings.supportPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl glass-panel bg-[#0d111a] border border-white/15 p-6 shadow-2xl text-white space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Invoice Header */}
        <div className="text-center border-b border-white/10 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black uppercase tracking-wider">{settings.siteName} Official Receipt</h3>
          <p className="text-xs text-gray-400 mt-0.5">অর্ডার সফলভাবে গ্রহণ করা হয়েছে!</p>
          <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-mono font-bold mt-2">
            Order ID: <strong>{order.id}</strong>
          </div>
        </div>

        {/* Details List */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-gray-400">গেম:</span>
            <span className="font-bold">{order.gameName}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-gray-400">প্যাকেজ:</span>
            <span className="font-bold text-right">{order.packages.map(p => p.name).join(', ')}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-gray-400">পেমেন্ট মেথড:</span>
            <span className="font-bold">{order.paymentMethod} (শেষ ৪ সংখ্যা: {order.senderLastDigits})</span>
          </div>

          {Object.entries(order.customData).map(([key, val]) => (
            <div key={key} className="flex justify-between py-1 border-b border-white/5">
              <span className="text-gray-400 capitalize">{key}:</span>
              <span className="font-mono text-gray-200">{val}</span>
            </div>
          ))}

          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-gray-400">তারিখ:</span>
            <span>{order.date}</span>
          </div>

          <div className="flex justify-between py-2 border-t border-white/10 text-sm font-extrabold">
            <span className="text-gray-200">মোট পরিশোধিত:</span>
            <span className="text-emerald-400">৳{order.totalAmount}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-gray-300" />
            <span>প্রিন্ট রসিদ</span>
          </button>

          <button
            onClick={handleWhatsAppHelp}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>হোয়াটসঅ্যাপে হেল্প</span>
          </button>
        </div>
      </div>
    </div>
  );
}

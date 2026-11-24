'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SiteSettings, CouponItem } from '@/lib/types';
import { Copy, Check, Truck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useClipboard } from '@/hooks/use-clipboard';

interface PaymentBoxProps {
  settings: SiteSettings;
  subtotal: number;
  appliedCoupon: CouponItem | null;
  onApplyCoupon: (code: string) => void;
  onSubmitOrder: (method: 'bKash' | 'Nagad', lastDigits: string) => void;
  isSubmitting: boolean;
}

export function PaymentBox({
  settings,
  subtotal,
  appliedCoupon,
  onApplyCoupon,
  onSubmitOrder,
  isSubmitting,
}: PaymentBoxProps) {
  const [method, setMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [lastDigits, setLastDigits] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const { copy, hasCopied } = useClipboard();

  const num = method === 'bKash' ? settings.bkashNumber : settings.nagadNumber;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = Math.max(0, subtotal - discount);

  return (
    <Card variant="glass" className="p-6 space-y-5 sticky top-20 border border-white/15">
      <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
        <div className="w-7 h-7 rounded-xl bg-red-600 text-white font-black text-xs flex items-center justify-center shadow-md">
          ৩
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-white">পেমেন্ট মেথড ও চেকআউট</h3>
          <p className="text-[11px] text-gray-400">বিকাশ বা নগদ সেন্ড মানি করুন</p>
        </div>
      </div>

      {/* Payment Tabs */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => setMethod('bKash')}
          className={`p-3 rounded-2xl border font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
            method === 'bKash'
              ? 'bg-pink-600 text-white border-pink-500 shadow-lg shadow-pink-600/30'
              : 'bg-white/5 border-white/10 text-gray-300'
          }`}
        >
          বিকাশ (bKash)
        </button>
        <button
          type="button"
          onClick={() => setMethod('Nagad')}
          className={`p-3 rounded-2xl border font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
            method === 'Nagad'
              ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-600/30'
              : 'bg-white/5 border-white/10 text-gray-300'
          }`}
        >
          নগদ (Nagad)
        </button>
      </div>

      {/* Send Money Number Card */}
      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
        <div className="text-[11px] text-gray-400">
          নিচের নম্বরে <strong>{method} Personal (Send Money)</strong> করুন:
        </div>
        <div className="flex items-center justify-between">
          <span className="text-base font-black text-white tracking-widest font-mono">{num}</span>
          <button
            type="button"
            onClick={() => copy(num)}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            {hasCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{hasCopied ? 'কপি হয়েছে' : 'কপি'}</span>
          </button>
        </div>
      </div>

      {/* Last Digits Input */}
      <Input
        label={`আপনার ${method} শেষ ৪ ডিজিট / TrxID *`}
        value={lastDigits}
        onChange={e => setLastDigits(e.target.value)}
        placeholder="e.g. 4821 অথবা TRX98271"
        className="font-mono"
      />

      {/* Coupon Input */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-300">কুপন কোড (ঐচ্ছিক)</label>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={couponCode}
            onChange={e => setCouponCode(e.target.value.toUpperCase())}
            placeholder="যেমন: SONIC10"
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white uppercase font-mono focus:outline-none focus:border-red-500"
          />
          <button
            type="button"
            onClick={() => onApplyCoupon(couponCode)}
            className="px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white font-bold text-xs transition-colors flex-shrink-0 cursor-pointer"
          >
            প্রয়োগ
          </button>
        </div>
      </div>

      {/* Price Summary */}
      <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1 text-xs">
        <div className="flex justify-between text-gray-400">
          <span>সাবটোটাল:</span>
          <span className="font-bold text-white">{formatCurrency(subtotal)}</span>
        </div>
        {appliedCoupon && (
          <div className="flex justify-between text-emerald-400 font-bold">
            <span>কুপন ছাড় ({appliedCoupon.code}):</span>
            <span>-{formatCurrency(appliedCoupon.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-white/10">
          <span>সর্বমোট মূল্য:</span>
          <span className="text-emerald-400 text-base">{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      {/* Submit Truck CTA */}
      <Button
        variant="primary"
        size="lg"
        loading={isSubmitting}
        onClick={() => onSubmitOrder(method, lastDigits)}
        className="w-full"
        icon={<Truck className="w-4 h-4 text-amber-300" />}
      >
        {isSubmitting ? 'অর্ডার প্রসেস হচ্ছে...' : `অর্ডার কনফার্ম করুন (${formatCurrency(grandTotal)})`}
      </Button>
    </Card>
  );
}

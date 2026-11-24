'use client';

import React from 'react';
import { OrderItem } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';
import { Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';

interface OrderCardProps {
  order: OrderItem;
  onViewInvoice: (order: OrderItem) => void;
}

export function OrderCard({ order, onViewInvoice }: OrderCardProps) {
  const { t } = useLanguage();

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/25 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3" /> {t('orderStatusCompleted')}
          </span>
        );
      case 'processing':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-300 bg-cyan-500/25 px-2.5 py-0.5 rounded-full border border-cyan-500/40">
            <Clock className="w-3 h-3 animate-spin" /> {t('orderStatusProcessing')}
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-red-300 bg-red-500/25 px-2.5 py-0.5 rounded-full border border-red-500/40">
            <XCircle className="w-3 h-3" /> {t('orderStatusCancelled')}
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/25 px-2.5 py-0.5 rounded-full border border-amber-500/40">
            <Clock className="w-3 h-3" /> {t('orderStatusPending')}
          </span>
        );
    }
  };

  return (
    <Card variant="glass" hoverable className="p-5 flex flex-col justify-between space-y-4 border-white/20">
      <div className="flex items-center justify-between border-b border-white/15 pb-3">
        <div>
          <span className="text-[10px] font-mono text-gray-400 block tracking-widest">{t('invoiceId')}</span>
          <span className="text-sm font-black text-white font-mono">{order.id}</span>
        </div>
        {getStatusBadge(order.status)}
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">{t('gameTitle')}:</span>
          <span className="font-bold text-white">{order.gameName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">{t('packageTitle')}:</span>
          <span className="font-bold text-white truncate max-w-[150px]">
            {order.packages.map(p => p.name).join(', ')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">{t('paymentMethod')}:</span>
          <span className="font-bold text-cyan-300">{order.paymentMethod} (..{order.senderLastDigits})</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">{t('orderDate')}:</span>
          <span className="text-gray-300">{order.date}</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/15 pt-3">
        <div>
          <span className="text-[10px] text-gray-400 block">{t('totalToPay')}</span>
          <span className="text-base font-black text-emerald-300">{formatCurrency(order.totalAmount)}</span>
        </div>
        <Button
          variant="glass"
          size="sm"
          onClick={() => onViewInvoice(order)}
          icon={<FileText className="w-3.5 h-3.5" />}
        >
          {t('viewReceipt')}
        </Button>
      </div>
    </Card>
  );
}

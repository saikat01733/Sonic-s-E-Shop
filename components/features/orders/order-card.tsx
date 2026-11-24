'use client';

import React from 'react';
import { OrderItem } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';

interface OrderCardProps {
  order: OrderItem;
  onViewInvoice: (order: OrderItem) => void;
}

export function OrderCard({ order, onViewInvoice }: OrderCardProps) {
  const getStatusBadge = () => {
    switch (order.status) {
      case 'Pending':
        return (
          <Badge variant="warning" icon={<Clock className="w-3 h-3" />}>
            পেন্ডিং ⏳
          </Badge>
        );
      case 'Processing':
        return (
          <Badge variant="info" icon={<Clock className="w-3 h-3 animate-spin" />}>
            প্রসেসিং ⚙️
          </Badge>
        );
      case 'Completed':
        return (
          <Badge variant="success" icon={<CheckCircle2 className="w-3 h-3" />}>
            সম্পন্ন ✅
          </Badge>
        );
      case 'Cancelled':
        return (
          <Badge variant="danger" icon={<XCircle className="w-3 h-3" />}>
            বাতিল ❌
          </Badge>
        );
    }
  };

  return (
    <Card variant="glass" hoverable className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono font-black text-white bg-white/10 px-2.5 py-1 rounded-lg">
            {order.id}
          </span>
          <span className="text-xs font-bold text-white">• {order.gameName}</span>
          {getStatusBadge()}
        </div>

        <div className="text-xs text-gray-300">
          প্যাকেজ: <strong className="text-white">{order.packages.map(p => p.name).join(', ')}</strong> | মোট:{' '}
          <strong className="text-emerald-400">{formatCurrency(order.totalAmount)}</strong> ({order.paymentMethod})
        </div>

        <div className="text-[11px] text-gray-400">তারিখ: {order.date}</div>
      </div>

      <Button
        variant="glass"
        size="sm"
        onClick={() => onViewInvoice(order)}
        icon={<FileText className="w-3.5 h-3.5 text-cyan-400" />}
      >
        রসিদ / ইনভয়েস
      </Button>
    </Card>
  );
}

import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, CheckCircle2, XCircle, Zap, ShieldCheck } from 'lucide-react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'hot' | 'speed' | 'success' | 'warning' | 'danger' | 'info' | 'custom';
  color?: string;
  icon?: React.ReactNode;
}

export function Badge({ className, variant = 'info', color, icon, children, ...props }: BadgeProps) {
  const variantStyles = {
    hot: 'bg-red-500 text-white shadow-md shadow-red-500/30',
    speed: 'bg-black/60 text-amber-300 border border-white/15 backdrop-blur-md',
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
    info: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    custom: '',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider',
        variantStyles[variant],
        className
      )}
      style={color ? { backgroundColor: `${color}25`, color, borderColor: `${color}50` } : undefined}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
}

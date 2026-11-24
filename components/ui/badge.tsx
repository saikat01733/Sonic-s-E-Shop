import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'hot' | 'speed' | 'success' | 'warning' | 'danger' | 'info' | 'custom';
  color?: string;
  icon?: React.ReactNode;
}

export function Badge({ className, variant = 'info', color, icon, children, ...props }: BadgeProps) {
  const variantStyles = {
    hot: 'bg-red-500/80 text-white border border-red-400/40 shadow-md shadow-red-500/25',
    speed: 'bg-black/60 text-cyan-300 border border-cyan-400/30 backdrop-blur-xl shadow-md',
    success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md',
    warning: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 backdrop-blur-md',
    danger: 'bg-red-500/20 text-red-300 border border-red-500/30 backdrop-blur-md',
    info: 'bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-md',
    custom: '',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
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

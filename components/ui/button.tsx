'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'glass' | 'pill' | 'danger' | 'success' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold transition-all duration-200 select-none active:scale-97 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer';

    const sizeStyles = {
      sm: 'text-[11px] px-3 py-1.5 rounded-xl gap-1.5',
      md: 'text-xs px-4 py-2.5 rounded-2xl gap-2',
      lg: 'text-sm px-6 py-3.5 rounded-2xl gap-2.5',
    };

    const variantStyles = {
      primary:
        'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-lg shadow-red-600/25 border border-red-500/30',
      glass:
        'liquid-glass text-white hover:bg-white/15 border-white/20 shadow-md',
      pill:
        'liquid-glass-pill text-white hover:bg-white/20 border-white/25 shadow-lg',
      danger:
        'bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30',
      success:
        'bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30',
      ghost:
        'bg-transparent hover:bg-white/10 text-gray-300 hover:text-white',
      outline:
        'border border-white/20 hover:border-white/40 text-gray-200 hover:text-white bg-transparent',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : icon}
        <span>{children}</span>
      </button>
    );
  }
);
Button.displayName = 'Button';

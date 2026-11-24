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
      'inline-flex items-center justify-center font-extrabold transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer';

    const sizeStyles = {
      sm: 'text-[11px] px-3.5 py-1.5 rounded-xl gap-1.5',
      md: 'text-xs px-5 py-2.5 rounded-2xl gap-2',
      lg: 'text-sm px-7 py-3 rounded-2xl gap-2.5',
    };

    const variantStyles = {
      primary:
        'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-600/30 border border-cyan-400/30 hover:shadow-cyan-500/40',
      glass:
        'bg-white/[0.07] hover:bg-white/[0.16] text-white border border-white/20 backdrop-blur-2xl shadow-md hover:border-white/40',
      pill:
        'bg-white/[0.07] hover:bg-white/[0.16] text-white border border-cyan-400/30 backdrop-blur-2xl shadow-lg rounded-full hover:border-cyan-400/60',
      danger:
        'bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/35 shadow-md shadow-red-500/20',
      success:
        'bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/35 shadow-md shadow-emerald-500/20',
      ghost:
        'bg-transparent hover:bg-white/10 text-gray-200 hover:text-white',
      outline:
        'border border-cyan-400/30 hover:border-cyan-400/60 text-white hover:bg-cyan-500/10 backdrop-blur-md',
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

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
        'bg-[oklch(45.5%_0.188_13.697)] hover:bg-[oklch(52%_0.20_13.697)] text-white shadow-lg shadow-[oklch(45.5%_0.188_13.697_/_0.35)] border border-[oklch(60%_0.18_13.697_/_0.40)] hover:shadow-[oklch(45.5%_0.188_13.697_/_0.50)]',
      glass:
        'bg-white/[0.07] [html.light-theme_&]:bg-black/[0.05] hover:bg-white/[0.16] [html.light-theme_&]:hover:bg-black/[0.1] text-white [html.light-theme_&]:text-slate-900 border border-white/20 [html.light-theme_&]:border-black/10 backdrop-blur-2xl shadow-md hover:border-white/40',
      pill:
        'bg-white/[0.07] [html.light-theme_&]:bg-black/[0.05] hover:bg-white/[0.16] [html.light-theme_&]:hover:bg-black/[0.1] text-white [html.light-theme_&]:text-slate-900 border border-white/20 [html.light-theme_&]:border-black/10 backdrop-blur-2xl shadow-lg rounded-full hover:border-[oklch(45.5%_0.188_13.697_/_0.5)]',
      danger:
        'bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/35 shadow-md shadow-red-500/20',
      success:
        'bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/35 shadow-md shadow-emerald-500/20',
      ghost:
        'bg-transparent hover:bg-white/10 [html.light-theme_&]:hover:bg-black/5 text-gray-200 [html.light-theme_&]:text-slate-700 hover:text-white [html.light-theme_&]:hover:text-black',
      outline:
        'border border-[oklch(45.5%_0.188_13.697_/_0.40)] hover:border-[oklch(45.5%_0.188_13.697)] text-white [html.light-theme_&]:text-slate-900 hover:bg-[oklch(45.5%_0.188_13.697_/_0.15)] backdrop-blur-md',
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

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-xs font-extrabold text-gray-200 [html.light-theme_&]:text-slate-700 block tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && <div className="absolute left-3 text-gray-400 [html.light-theme_&]:text-slate-500 pointer-events-none">{icon}</div>}
          <input
            ref={ref}
            type={type}
            className={cn(
              'w-full py-2.5 rounded-xl bg-white/[0.06] [html.light-theme_&]:bg-slate-100/90 border border-white/15 [html.light-theme_&]:border-slate-300 text-xs text-white [html.light-theme_&]:text-slate-900 placeholder:text-gray-500 [html.light-theme_&]:placeholder:text-slate-400 focus:outline-none focus:border-rose-500/80 focus:bg-white/[0.1] [html.light-theme_&]:focus:bg-white focus:shadow-[0_0_0_3px_rgba(225,29,72,0.15)] transition-all duration-200',
              icon ? 'pl-9 pr-3.5' : 'px-3.5',
              error && 'border-red-500 focus:border-red-500',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-[10px] text-red-400 [html.light-theme_&]:text-red-600 font-semibold tracking-wide">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

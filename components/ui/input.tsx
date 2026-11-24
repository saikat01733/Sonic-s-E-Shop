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
        {label && <label className="text-xs font-extrabold text-gray-200 block tracking-wide">{label}</label>}
        <div className="relative flex items-center">
          {icon && <div className="absolute left-3 text-gray-400 pointer-events-none">{icon}</div>}
          <input
            ref={ref}
            type={type}
            className={cn(
              'w-full py-2.5 rounded-2xl bg-white/[0.06] border border-white/20 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-red-500/70 focus:bg-white/[0.1] focus:shadow-[0_0_15px_rgba(255,42,75,0.25)] transition-all duration-300 backdrop-blur-xl',
              icon ? 'pl-9 pr-3.5' : 'px-3.5',
              error && 'border-red-500 focus:border-red-500',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-[10px] text-red-400 font-semibold tracking-wide">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

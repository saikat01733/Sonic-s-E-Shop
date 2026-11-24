import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'glass-sm' | 'pill';
  hoverable?: boolean;
}

export function Card({ className, variant = 'glass', hoverable = false, children, ...props }: CardProps) {
  const variantClass = {
    glass: 'liquid-glass',
    'glass-sm': 'liquid-glass-sm',
    pill: 'liquid-glass-pill',
  }[variant];

  return (
    <div
      className={cn(
        variantClass,
        hoverable && 'liquid-glass-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

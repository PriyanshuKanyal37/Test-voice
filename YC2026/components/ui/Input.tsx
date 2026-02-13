'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-xl border bg-white py-3 text-sm font-medium shadow-sm',
            'transition-all focus:border-[#135bec] focus:ring-4 focus:ring-[#135bec]/10 focus:outline-none',
            'dark:bg-slate-800 dark:text-white dark:placeholder-slate-500',
            icon ? 'pl-10 pr-4' : 'px-4',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
              : 'border-slate-200 dark:border-slate-700',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };

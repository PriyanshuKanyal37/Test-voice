'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-[#135bec] hover:bg-blue-700 active:bg-blue-800 text-white shadow-lg shadow-[#135bec]/30',
      secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white',
      outline: 'border border-slate-200 hover:border-[#135bec] hover:text-[#135bec] bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:border-[#135bec]',
      ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
    };

    const sizes = {
      sm: 'text-sm px-3 py-1.5 rounded-lg gap-1.5',
      md: 'text-sm px-5 py-2.5 rounded-lg gap-2',
      lg: 'text-lg px-6 py-3 rounded-xl gap-2',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          !disabled && 'hover:-translate-y-0.5',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="animate-spin size-4 border-2 border-current border-t-transparent rounded-full" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };

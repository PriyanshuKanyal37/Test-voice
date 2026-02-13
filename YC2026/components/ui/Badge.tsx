import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variants = {
      default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      primary: 'bg-[#135bec]/10 text-[#135bec]',
      success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      outline: 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400',
    };

    const sizes = {
      sm: 'text-[10px] px-1.5 py-0.5',
      md: 'text-xs px-2 py-1',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-semibold rounded-md',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };

'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <textarea
          ref={ref}
          className={cn(
            'w-full rounded-xl border bg-white p-4 text-sm font-medium shadow-sm resize-none',
            'transition-all focus:border-[#135bec] focus:ring-4 focus:ring-[#135bec]/10 focus:outline-none',
            'dark:bg-slate-800 dark:text-white dark:placeholder-slate-500',
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

Textarea.displayName = 'Textarea';

export { Textarea };

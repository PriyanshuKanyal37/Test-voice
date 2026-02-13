import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  variant: 'live' | 'recording' | 'ready' | 'generating' | 'error' | 'paused' | 'processing';
  label?: string;
  className?: string;
}

export function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  const variants = {
    live: {
      container: 'flex items-center gap-1.5',
      content: (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {label || 'Live Connection'}
          </span>
        </>
      ),
    },
    recording: {
      container: 'px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-wide',
      content: label || 'Recording',
    },
    ready: {
      container: 'px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold',
      content: label || 'Ready',
    },
    generating: {
      container: 'flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-semibold',
      content: (
        <>
          <span className="block size-2 rounded-full bg-slate-400 animate-pulse" />
          {label || 'Generating...'}
        </>
      ),
    },
    error: {
      container: 'px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold',
      content: label || 'Error',
    },
    paused: {
      container: 'flex items-center gap-1.5',
      content: (
        <>
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {label || 'Paused'}
          </span>
        </>
      ),
    },
    processing: {
      container: 'flex items-center gap-1.5',
      content: (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {label || 'Processing'}
          </span>
        </>
      ),
    },
  };

  return (
    <span className={cn(variants[variant].container, className)}>
      {variants[variant].content}
    </span>
  );
}

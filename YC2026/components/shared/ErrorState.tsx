import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  message?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ 
  message = 'Something went wrong', 
  description,
  onRetry,
  className 
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center min-h-[400px]', className)}>
      <div className="text-red-500 mb-4">
        <span className="material-symbols-outlined text-5xl">error</span>
      </div>
      <p className="text-slate-900 dark:text-white font-semibold mb-2">
        {message}
      </p>
      {description && (
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 max-w-md text-center">
          {description}
        </p>
      )}
      {onRetry && (
        <Button onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}

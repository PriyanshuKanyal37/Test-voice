'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface SelectionBarProps {
  selectedCount: number;
  onClear: () => void;
  onContinue: () => void;
  isLoading?: boolean;
}

export function SelectionBar({ selectedCount, onClear, onContinue, isLoading }: SelectionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-lg shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="max-w-5xl mx-auto p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="size-6 bg-[#135bec] text-white rounded-full flex items-center justify-center text-xs font-bold">
              {selectedCount}
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              Topic{selectedCount !== 1 ? 's' : ''} Selected
            </span>
          </div>
          <button
            onClick={onClear}
            className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          >
            Clear selection
          </button>
        </div>

        <Button onClick={onContinue} isLoading={isLoading}>
          Create Interview
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </Button>
      </div>
    </div>
  );
}

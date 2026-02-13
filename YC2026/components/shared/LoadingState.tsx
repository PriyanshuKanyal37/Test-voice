'use client';

import { useState, useEffect } from 'react';
import { useLoadingMessage } from '@/hooks/useLoadingMessage';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  messages?: string[];
  className?: string;
  showTimer?: boolean;
}

// Predefined heights to avoid hydration mismatch
const BAR_HEIGHTS = [32, 48, 24, 56, 40, 28, 52, 36];

export function LoadingState({ message, messages, className, showTimer = true }: LoadingStateProps) {
  const dynamicMessage = useLoadingMessage(messages);
  const displayMessage = message || dynamicMessage;
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer to show elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className={cn('flex flex-col items-center justify-center min-h-[400px]', className)}>
      {/* Waveform Animation */}
      <div className="flex items-center gap-1 mb-4">
        {BAR_HEIGHTS.map((height, i) => (
          <div
            key={i}
            className="w-1 bg-[#135bec] rounded-full animate-pulse"
            style={{
              height: `${height}px`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">
        {displayMessage}
      </p>
      {showTimer && (
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-3">
          Elapsed: {formatTime(elapsedSeconds)}
        </p>
      )}
    </div>
  );
}

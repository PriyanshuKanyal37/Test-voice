'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface WaveformProps {
  isActive?: boolean;
  barCount?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Predefined heights to avoid hydration mismatch
const WAVE_HEIGHTS = [20, 35, 25, 45, 60, 40, 55, 70, 45, 30, 50, 65, 35, 25, 40, 55, 30, 45, 28, 52, 38, 62, 42, 58, 32, 48, 55, 35, 68, 22, 45, 58, 30, 42, 65, 38, 50, 28, 55, 40];

export function Waveform({ 
  isActive = false, 
  barCount = 18, 
  size = 'lg',
  className 
}: WaveformProps) {
  const sizeStyles = {
    sm: 'h-12 gap-0.5',
    md: 'h-20 gap-1',
    lg: 'h-32 gap-1.5',
  };

  const barSizes = {
    sm: 'w-1',
    md: 'w-1.5',
    lg: 'w-1.5',
  };

  // Use deterministic heights based on index
  const bars = useMemo(() => {
    return Array.from({ length: barCount }).map((_, i) => {
      const baseHeight = WAVE_HEIGHTS[i % WAVE_HEIGHTS.length];
      const opacity = 0.3 + (Math.sin((i / barCount) * Math.PI) * 0.7);
      return { height: baseHeight, opacity };
    });
  }, [barCount]);

  return (
    <div className={cn('relative flex items-center justify-center', sizeStyles[size], className)}>
      {/* Ambient glow background (only when active) */}
      {isActive && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#135bec]/20 rounded-full blur-[60px] animate-pulse-slow" />
      )}

      {/* Wave bars */}
      {bars.map((bar, i) => (
        <div
          key={i}
          className={cn(
            barSizes[size],
            'bg-[#135bec] rounded-full transition-all duration-200',
            isActive && 'animate-pulse'
          )}
          style={{
            height: `${bar.height}%`,
            opacity: bar.opacity,
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}

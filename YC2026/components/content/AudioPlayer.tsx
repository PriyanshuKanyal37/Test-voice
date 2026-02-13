'use client';

import { useState } from 'react';
import { Waveform } from '@/components/interview/Waveform';
import { formatDuration } from '@/lib/utils';

interface AudioPlayerProps {
  duration: number;
  onTimestampClick?: (time: number) => void;
}

export function AudioPlayer({ duration, onTimestampClick }: AudioPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    setCurrentTime(newTime);
    onTimestampClick?.(newTime);
  };

  const toggleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    setPlaybackSpeed(speeds[(currentIndex + 1) % speeds.length]);
  };

  const progress = (currentTime / duration) * 100;

  return (
    <div className="sticky bottom-0 bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-slate-700 p-4">
      {/* Mini Waveform */}
      <div className="mb-3">
        <Waveform size="sm" isActive={isPlaying} barCount={40} />
      </div>

      {/* Progress Bar */}
      <div className="relative h-1 bg-slate-200 dark:bg-slate-700 rounded-full mb-3 cursor-pointer">
        <div
          className="absolute h-full bg-[#135bec] rounded-full"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute w-3 h-3 bg-[#135bec] rounded-full -top-1 shadow"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Rewind 10s */}
          <button
            onClick={() => handleSkip(-10)}
            className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">replay_10</span>
          </button>

          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            className="size-12 bg-[#135bec] text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg shadow-[#135bec]/30"
          >
            <span className="material-symbols-outlined text-[28px]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          {/* Forward 10s */}
          <button
            onClick={() => handleSkip(10)}
            className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">forward_10</span>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          {/* Speed */}
          <button
            onClick={toggleSpeed}
            className="px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {playbackSpeed}x
          </button>

          {/* Time */}
          <span className="font-mono text-sm text-slate-600 dark:text-slate-400">
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}

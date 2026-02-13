'use client';

import { cn } from '@/lib/utils';

interface ControlDockProps {
  isListening: boolean;
  isPaused?: boolean;
  onPause: () => void;
  onMicToggle: () => void;
  onEnd: () => void;
}

export function ControlDock({ 
  isListening, 
  isPaused,
  onPause, 
  onMicToggle, 
  onEnd 
}: ControlDockProps) {
  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center px-4 z-50">
      <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/90 dark:bg-surface-dark/90 backdrop-blur-md shadow-xl border border-slate-200/60 dark:border-slate-700/60">
        {/* Pause Button */}
        <button
          onClick={onPause}
          className="group flex flex-col items-center justify-center size-14 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
        >
          <span className="material-symbols-outlined text-[28px] group-hover:scale-110 transition-transform">
            {isPaused ? 'play_circle' : 'pause_circle'}
          </span>
          <span className="text-[10px] font-medium mt-0.5">
            {isPaused ? 'Resume' : 'Pause'}
          </span>
        </button>

        {/* Active Mic (Primary) */}
        <button
          onClick={onMicToggle}
          className={cn(
            'relative group flex items-center justify-center size-20 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95',
            isListening
              ? 'bg-[#135bec] text-white shadow-[#135bec]/30'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          )}
        >
          <div className="absolute inset-0 rounded-2xl border border-white/20" />

          {/* Pulse ring (only when listening) */}
          {isListening && (
            <span className="absolute inline-flex h-full w-full rounded-2xl bg-[#135bec] opacity-20 animate-ping" />
          )}

          <div className="flex flex-col items-center z-10">
            <span className="material-symbols-outlined text-[32px]">
              {isListening ? 'mic' : 'mic_off'}
            </span>
            <span className="text-[10px] font-bold mt-0.5 tracking-wide">
              {isListening ? 'LISTENING' : 'MUTED'}
            </span>
          </div>
        </button>

        {/* End Button */}
        <button
          onClick={onEnd}
          className="group flex flex-col items-center justify-center size-14 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
        >
          <span className="material-symbols-outlined text-[28px] group-hover:scale-110 transition-transform">
            call_end
          </span>
          <span className="text-[10px] font-medium mt-0.5">End</span>
        </button>
      </div>
    </div>
  );
}

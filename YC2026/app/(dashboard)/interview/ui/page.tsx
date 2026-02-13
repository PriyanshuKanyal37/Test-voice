'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Waveform } from '@/components/interview/Waveform';
import { TranscriptPanel } from '@/components/interview/TranscriptPanel';
import { ControlDock } from '@/components/interview/ControlDock';
import { ProgressPill } from '@/components/interview/ProgressPill';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDuration } from '@/lib/utils';
import type { TranscriptMessage } from '@/lib/types/transcript';

const MOCK_MESSAGES: TranscriptMessage[] = [
  { role: 'assistant', content: 'Welcome. What is your boldest view on AI workflows right now?' },
  { role: 'user', content: 'Most teams automate tasks but do not redesign decision-making.' },
  { role: 'assistant', content: 'Give me one concrete moment where that failed in your work.' },
  { role: 'user', content: 'We automated reporting but still waited two days for approvals.' },
  { role: 'assistant', content: 'What changed after you fixed that bottleneck?' },
];

export default function VoiceAgentUiPage() {
  const router = useRouter();
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setDuration((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const questionCount = useMemo(
    () => MOCK_MESSAGES.filter((message) => message.role === 'assistant').length,
    []
  );

  const handlePauseToggle = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const handleEnd = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  const statusVariant: 'live' | 'paused' = isMuted ? 'paused' : 'live';
  const statusLabel = isMuted ? 'Muted' : 'UI Preview';

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-[#135bec] flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-white hidden md:inline">LadderFlow</span>
        </Link>

        <div className="flex items-center gap-4">
          <StatusBadge variant={statusVariant} label={statusLabel} />
          <ProgressPill current={questionCount} total={5} />
        </div>

        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <span className="material-symbols-outlined text-[20px]">timer</span>
          <span className="font-mono text-sm font-medium">{formatDuration(duration)}</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10">
          <div className="mb-6 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              Voice Agent UI Preview
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              UI-only mode. No live Deepgram or backend calls.
            </p>
          </div>

          <Waveform isActive={!isMuted} size="lg" />

          <div className="mt-6 text-center">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isMuted ? 'Muted' : 'Listening'}
            </p>
          </div>
        </div>

        <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">Live Transcript</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">{MOCK_MESSAGES.length} messages</span>
          </div>

          <TranscriptPanel
            messages={MOCK_MESSAGES}
            isRecording={!isMuted}
            currentText={isMuted ? '' : 'Previewing microphone state...'}
          />
        </div>
      </div>

      <ControlDock
        isListening={!isMuted}
        isPaused={isMuted}
        onPause={handlePauseToggle}
        onMicToggle={handlePauseToggle}
        onEnd={handleEnd}
      />
    </div>
  );
}

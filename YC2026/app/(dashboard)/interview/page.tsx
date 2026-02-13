'use client';

import { useEffect, useMemo, useRef, useState, useCallback, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDeepgramAgent } from '@/hooks/useDeepgramAgent';
import { DeepgramConfig } from '@/lib/types/agent';
import { ResearchResult } from '@/lib/types/trending';
import { formatTranscript } from '@/lib/api/transcript';
import { Waveform } from '@/components/interview/Waveform';
import { TranscriptPanel } from '@/components/interview/TranscriptPanel';
import { ControlDock } from '@/components/interview/ControlDock';
import { ProgressPill } from '@/components/interview/ProgressPill';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingState } from '@/components/shared/LoadingState';

const SESSION_SEPARATOR = '__SESSION_SPLIT__';
const SSR_SESSION_SNAPSHOT = '__SSR_SESSION__';

type ParsedSessionState = {
  loading: boolean;
  missing: boolean;
  parseError: boolean;
  researchContext: ResearchResult | null;
  agentConfig: DeepgramConfig | null;
};

function getClientSessionSnapshot(): string {
  const storedConfig = sessionStorage.getItem('agent-config') ?? '';
  const storedContext = sessionStorage.getItem('research-context') ?? '';
  return `${storedConfig}${SESSION_SEPARATOR}${storedContext}`;
}

function getServerSessionSnapshot(): string {
  return SSR_SESSION_SNAPSHOT;
}

export default function InterviewPage() {
  const router = useRouter();
  const sessionSnapshot = useSyncExternalStore(
    () => () => {},
    getClientSessionSnapshot,
    getServerSessionSnapshot
  );

  const sessionState = useMemo<ParsedSessionState>(() => {
    if (sessionSnapshot === SSR_SESSION_SNAPSHOT) {
      return {
        loading: true,
        missing: false,
        parseError: false,
        researchContext: null,
        agentConfig: null,
      };
    }

    const [storedConfig = '', storedContext = ''] = sessionSnapshot.split(SESSION_SEPARATOR);

    if (!storedConfig || !storedContext) {
      return {
        loading: false,
        missing: true,
        parseError: false,
        researchContext: null,
        agentConfig: null,
      };
    }

    try {
      const fullConfig = JSON.parse(storedConfig);
      const parsedContext = JSON.parse(storedContext) as ResearchResult;
      const parsedConfig = (fullConfig.deepgramConfig ?? fullConfig) as DeepgramConfig;

      return {
        loading: false,
        missing: false,
        parseError: false,
        researchContext: parsedContext,
        agentConfig: parsedConfig,
      };
    } catch {
      return {
        loading: false,
        missing: false,
        parseError: true,
        researchContext: null,
        agentConfig: null,
      };
    }
  }, [sessionSnapshot]);

  const [duration, setDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isEndingRef = useRef(false);
  const { researchContext, agentConfig, parseError, missing, loading } = sessionState;

  const handleError = useCallback((err: string) => {
    console.error('Deepgram error:', err);
  }, []);

  const {
    state,
    messages,
    connect,
    disconnect,
    toggleMute,
    isMuted,
  } = useDeepgramAgent({
    onError: handleError,
  });

  useEffect(() => {
    if (!loading && (parseError || missing)) {
      router.push('/discover/trending');
    }
  }, [loading, parseError, missing, router]);

  useEffect(() => {
    if (agentConfig && !isEndingRef.current && !state.isConnected && !state.error) {
      connect(agentConfig).catch(console.error);
    }
  }, [agentConfig, connect, state.isConnected, state.error]);

  useEffect(() => {
    if (state.isConnected) {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.isConnected]);

  const handleEnd = useCallback(async () => {
    isEndingRef.current = true;
    disconnect();

    try {
      if (!researchContext) return;

      const sessionId = Date.now().toString();
      sessionStorage.setItem('interview-topic', researchContext.title);
      sessionStorage.setItem('interview-duration', duration.toString());
      sessionStorage.setItem('interview-messages', JSON.stringify(messages));

      formatTranscript({
        topic: researchContext.title,
        userName: 'Guest',
        messages,
        duration,
      }).catch((e) => console.error('Failed to format transcript:', e));

      router.push(`/review/${sessionId}`);
    } catch (e) {
      console.error('Failed to end call:', e);
      router.push('/discover/trending');
    }
  }, [disconnect, duration, messages, researchContext, router]);

  const getStatusVariant = (): 'live' | 'paused' | 'processing' => {
    if (isMuted) return 'paused';
    if (state.isThinking) return 'processing';
    return 'live';
  };

  const getStatusLabel = (): string => {
    if (isMuted) return 'Muted';
    if (state.isSpeaking) return 'AI Speaking';
    if (state.isThinking) return 'AI Thinking';
    if (state.isListening) return 'Listening';
    if (!state.isConnected) return 'Connecting';
    return 'Active';
  };

  const questionCount = useMemo(
    () => messages.filter((message) => message.role === 'assistant').length,
    [messages]
  );

  const totalQuestions = researchContext?.discussion_points.length || 5;

  const formattedDuration = useMemo(() => {
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [duration]);

  if (loading || !agentConfig || !researchContext) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <LoadingState message="Loading interview..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-[#135bec] flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-white hidden md:inline">
            LadderFlow
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <StatusBadge variant={getStatusVariant()} label={getStatusLabel()} />
          <ProgressPill current={Math.max(questionCount, 1)} total={totalQuestions} />
        </div>

        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <span className="material-symbols-outlined text-[20px]">timer</span>
          <span className="font-mono text-sm font-medium">{formattedDuration}</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10">
          <div className="mb-6 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              {researchContext.title}
            </h2>
          </div>

          <Waveform isActive={state.isListening || state.isSpeaking} size="lg" />

          <div className="mt-6 text-center">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {getStatusLabel()}
            </p>
            {state.error && (
              <p className="text-red-500 text-sm mt-2">{state.error}</p>
            )}
          </div>
        </div>

        <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">Live Transcript</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {messages.length} messages
            </span>
          </div>

          <TranscriptPanel
            messages={messages}
            isRecording={state.isListening && !isMuted}
            currentText=""
          />
        </div>
      </div>

      <ControlDock
        isListening={!isMuted}
        isPaused={isMuted}
        onPause={toggleMute}
        onMicToggle={toggleMute}
        onEnd={handleEnd}
      />
    </div>
  );
}

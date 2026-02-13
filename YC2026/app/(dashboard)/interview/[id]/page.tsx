'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Waveform } from '@/components/interview/Waveform';
import { TranscriptPanel } from '@/components/interview/TranscriptPanel';
import { ControlDock } from '@/components/interview/ControlDock';
import { ProgressPill } from '@/components/interview/ProgressPill';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/Button';
import { formatDuration } from '@/lib/utils';
import { useDeepgramAgent } from '@/hooks/useDeepgramAgent';
import { useAgentConfig } from '@/hooks/useAgentConfig';
import type { TranscriptMessage } from '@/lib/types/transcript';
import type { TrendingTopic } from '@/lib/types/trending';
import type { DeepgramConfig } from '@/lib/types/agent';

type InterviewPhase = 'loading' | 'ready' | 'connecting' | 'active' | 'ending' | 'error';

export default function InterviewPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [phase, setPhase] = useState<InterviewPhase>('loading');
  const [duration, setDuration] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [topic, setTopic] = useState<TrendingTopic | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedRef = useRef(false);

  // Agent config mutation
  const { mutateAsync: generateConfig, isPending: isGeneratingConfig } = useAgentConfig();

  // Deepgram agent hook
  const {
    state: agentState,
    messages,
    connect,
    disconnect,
    toggleMute,
    isMuted,
  } = useDeepgramAgent({
    onMessage: (message) => {
      // Count assistant messages as questions
      if (message.role === 'assistant') {
        setQuestionCount(prev => prev + 1);
      }
    },
    onError: (error) => {
      console.error('Agent error:', error);
      setErrorMessage(error);
      setPhase('error');
    },
  });

  // Load selected topic from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('selected-topics');
    if (stored) {
      const topics = JSON.parse(stored) as TrendingTopic[];
      if (topics.length > 0) {
        setTopic(topics[0]);
        setPhase('ready');
      } else {
        setPhase('error');
        setErrorMessage('No topic selected. Please go back and select a topic.');
      }
    } else {
      setPhase('error');
      setErrorMessage('No topic selected. Please go back and select a topic.');
    }
  }, []);

  // Timer - only run when active
  useEffect(() => {
    if (phase === 'active' && agentState.isConnected) {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [phase, agentState.isConnected]);

  // Update phase based on agent state
  useEffect(() => {
    if (agentState.isConnected && phase === 'connecting') {
      setPhase('active');
    }
  }, [agentState.isConnected, phase]);

  // Start the interview
  const handleStart = useCallback(async () => {
    if (!topic || hasStartedRef.current) return;
    hasStartedRef.current = true;

    try {
      setPhase('connecting');
      setErrorMessage(null);

      // Generate agent config from backend
      const config = await generateConfig({
        topic: topic.topic_title,
        userName: 'Guest', // TODO: Get from user profile
        topic_title: topic.topic_title,
        global_context: topic.global_context,
        why_this_matters: topic.why_this_matters,
        key_questions: topic.key_questions,
      });

      // Connect to Deepgram with the generated config
      await connect(config.deepgramConfig as DeepgramConfig);

    } catch (error) {
      console.error('Failed to start interview:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to start interview');
      setPhase('error');
      hasStartedRef.current = false;
    }
  }, [topic, generateConfig, connect]);

  // End the interview
  const handleEnd = useCallback(() => {
    setPhase('ending');
    disconnect();

    // Store interview data for content review
    sessionStorage.setItem('interview-messages', JSON.stringify(messages));
    sessionStorage.setItem('interview-duration', duration.toString());
    sessionStorage.setItem('interview-topic', topic?.topic_title || 'General Discussion');

    // Navigate to review page
    router.push(`/review/${sessionId}`);
  }, [disconnect, messages, duration, topic, router, sessionId]);

  // Handle pause/resume (mute/unmute)
  const handlePauseToggle = useCallback(() => {
    toggleMute();
  }, [toggleMute]);

  // Get status for display
  const getStatusVariant = (): 'live' | 'paused' | 'processing' => {
    if (isMuted) return 'paused';
    if (agentState.isThinking) return 'processing';
    return 'live';
  };

  const getStatusLabel = (): string => {
    if (isMuted) return 'Muted';
    if (agentState.isSpeaking) return 'AI Speaking';
    if (agentState.isThinking) return 'AI Thinking';
    if (agentState.isListening) return 'Listening';
    return 'Active';
  };

  // Render based on phase
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <LoadingState message="Loading interview..." />
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark p-6">
        <div className="text-center max-w-md">
          <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {errorMessage || 'An unexpected error occurred.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push('/discover')}>
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Go Back
            </Button>
            <Button onClick={() => {
              hasStartedRef.current = false;
              setPhase('ready');
              setErrorMessage(null);
            }}>
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'ready') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark p-6">
        <div className="text-center max-w-lg">
          {/* Topic Preview */}
          {topic && (
            <div className="mb-8">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                Today&apos;s Topic
              </span>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                {topic.topic_title}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {topic.why_this_matters}
              </p>
            </div>
          )}

          {/* Mic Permission Notice */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">mic</span>
              <div className="text-left">
                <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                  Microphone access required
                </p>
                <p className="text-amber-700 dark:text-amber-300 text-xs mt-1">
                  Please allow microphone access when prompted to enable voice conversation.
                </p>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <Button
            size="lg"
            onClick={handleStart}
            disabled={isGeneratingConfig}
            className="min-w-[200px]"
          >
            {isGeneratingConfig ? (
              <>
                <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                Preparing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                Start Interview
              </>
            )}
          </Button>

          <p className="text-slate-500 dark:text-slate-400 text-xs mt-4">
            The AI will guide you through a conversation about this topic
          </p>
        </div>
      </div>
    );
  }

  if (phase === 'connecting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <LoadingState
          messages={[
            'Connecting to AI interviewer...',
            'Setting up voice recognition...',
            'Initializing conversation...',
          ]}
        />
      </div>
    );
  }

  // Active interview view
  const totalQuestions = topic?.key_questions.length || 5;

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-[#135bec] flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-white hidden md:inline">
            LadderFlow
          </span>
        </Link>

        {/* Center: Status + Progress */}
        <div className="flex items-center gap-4">
          <StatusBadge variant={getStatusVariant()} label={getStatusLabel()} />
          <ProgressPill current={Math.min(questionCount, totalQuestions)} total={totalQuestions} />
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <span className="material-symbols-outlined text-[20px]">timer</span>
          <span className="font-mono text-sm font-medium">
            {formatDuration(duration)}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Waveform */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10">
          {/* Topic Title */}
          {topic && (
            <div className="mb-6 text-center">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                {topic.topic_title}
              </h2>
            </div>
          )}

          {/* Waveform */}
          <Waveform 
            isActive={agentState.isListening || agentState.isSpeaking} 
            size="lg" 
          />

          {/* Status Label */}
          <div className="mt-6 text-center">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {getStatusLabel()}
            </p>
            {agentState.error && (
              <p className="text-red-500 text-sm mt-2">{agentState.error}</p>
            )}
          </div>
        </div>

        {/* Right Side: Transcript */}
        <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark flex flex-col">
          {/* Transcript Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Live Transcript
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {messages.length} messages
            </span>
          </div>

          {/* Transcript Messages */}
          <TranscriptPanel
            messages={messages}
            isRecording={agentState.isListening && !isMuted}
            currentText={currentTranscript}
          />
        </div>
      </div>

      {/* Control Dock */}
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

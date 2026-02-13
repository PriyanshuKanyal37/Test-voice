'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTrendingTopics } from '@/hooks/useTrendingTopics';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Button } from '@/components/ui/Button';

export default function TrendingTopicsPage() {
  const router = useRouter();
  const [keywords] = useState(() => {
    if (typeof window === 'undefined') return '';
    return sessionStorage.getItem('trending-keywords') ?? '';
  });

  useEffect(() => {
    if (!keywords) {
      router.push('/discover');
    }
  }, [keywords, router]);

  const { data: research, isLoading, error, refetch } = useTrendingTopics({
    keywords,
    enabled: keywords.length > 0,
  });

  const handleStartInterview = () => {
    if (!research) return;

    // Keep full research in storage for voice-agent context.
    sessionStorage.setItem('research-context', JSON.stringify(research));
    router.push('/interview/new');
  };

  if (isLoading) {
    return (
      <LoadingState
        messages={[
          'Running deep research agent...',
          'Scanning credible sources...',
          'Synthesizing key insights...',
          'Drafting discussion points...',
          'Generating deep context...',
        ]}
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        message="Research Agent Failed"
        description={error.message}
        onRetry={() => refetch()}
      />
    );
  }

  if (!research) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <PageHeader
        title="Research Complete"
        subtitle={`Deep dive on: "${keywords}"`}
      >
        <Button variant="outline" onClick={() => router.push('/discover')}>
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          New Search
        </Button>
      </PageHeader>

      <div className="animate-in fade-in-50 duration-500">
        <div className="bg-slate-50 dark:bg-slate-900/50 p-8 md:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -translate-y-20 translate-x-20" />

          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 mb-4">
            {research.title}
          </h1>

          <p
            className="text-slate-600 dark:text-slate-300 leading-relaxed text-base md:text-lg mb-8"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {research.deep_context}
          </p>

          <Button
            size="lg"
            className="shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white min-w-[220px]"
            onClick={handleStartInterview}
          >
            <span className="material-symbols-outlined mr-2">mic</span>
            Start Interview
          </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeywordInput } from '@/components/trends/KeywordInput';
import { Button } from '@/components/ui/Button';
import { AmbientGlow } from '@/components/shared/AmbientGlow';

export default function DiscoverPage() {
  const router = useRouter();
  const [keywords, setKeywords] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!keywords.trim()) return;
    
    setIsLoading(true);
    // Store keywords in sessionStorage to pass to trending page
    sessionStorage.setItem('trending-keywords', keywords.trim());
    router.push('/discover/trending');
  };

  const isDisabled = !keywords.trim() || isLoading;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Ambient Background */}
      <AmbientGlow />

      {/* Content */}
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight mb-3">
            What do you want to talk about today?
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg">
            Enter 3-5 keywords separated by commas to get started
          </p>
        </div>

        {/* Keyword Input Card */}
        <div className="mb-6">
          <KeywordInput
            value={keywords}
            onChange={setKeywords}
            onSubmit={handleSubmit}
            disabled={isLoading}
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isDisabled}
          isLoading={isLoading}
          size="lg"
          className="w-full h-14 group relative overflow-hidden"
        >
          <span className="relative z-10">Discover Trending Topics</span>
          <span className="material-symbols-outlined relative z-10 transition-transform group-hover:translate-x-1">
            arrow_forward
          </span>

          {/* Shine effect */}
          {!isDisabled && (
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
          )}
        </Button>

        {/* Helper text */}
        <p className="text-center text-sm text-slate-400 dark:text-slate-500 mt-4">
          We&apos;ll analyze conversations to generate unique, trending ideas for your content
        </p>
      </div>
    </div>
  );
}

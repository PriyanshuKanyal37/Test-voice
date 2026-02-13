'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResearchResult } from '@/lib/types/trending';
import { generateAgentConfig } from '@/lib/api/agent';
import { ArrowLeft, Mic, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export default function InterviewSetupPage() {
    const router = useRouter();
    const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);
    const [userName, setUserName] = useState('Guest');
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Load research context from session storage
        const storedContext = sessionStorage.getItem('research-context');

        if (!storedContext) {
            // Redirect back to discovery if no context found
            router.push('/discover/trending');
            return;
        }

        try {
            const parsedContext = JSON.parse(storedContext) as ResearchResult;
            setResearchResult(parsedContext);
            setIsLoading(false);
        } catch (e) {
            console.error('Failed to parse research context:', e);
            setError('Invalid research context found.');
            setIsLoading(false);
        }
    }, [router]);

    const handleStartInterview = async () => {
        if (!researchResult) return;

        setIsGenerating(true);
        setError(null);

        try {
            console.log('Generating agent config for topic:', researchResult.title);

            const config = await generateAgentConfig({
                topic: researchResult.title,
                userName: userName,
                topic_title: researchResult.title,
                global_context: researchResult.deep_context,
                why_this_matters: researchResult.key_insights.join('\n'), // Combine insights
                key_questions: researchResult.discussion_points,
            });

            console.log('Agent config generated:', config);

            // Store the agent config for the interview session
            sessionStorage.setItem('agent-config', JSON.stringify(config));

            // Navigate to the interview session
            // Assuming we'll create this page next
            router.push('/interview');

        } catch (err) {
            console.error('Failed to start interview:', err);
            setError('Failed to initialize the interview agent. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                <p className="text-slate-600 dark:text-slate-400">Loading research context...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-6">
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 border border-red-100 dark:border-red-900/30 max-w-md w-full">
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    <p>{error}</p>
                </div>
                <button
                    onClick={() => router.push('/discover/trending')}
                    className="mt-6 px-6 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                    Back to Discovery
                </button>
            </div>
        );
    }

    if (!researchResult) return null;

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white pb-20">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-medium">Back</span>
                    </button>
                    <div className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Interview Setup
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-10">
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-full mb-6">
                        <Mic className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                        Ready to record?
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                        Configure your AI host before starting the interview session about <span className="text-slate-900 dark:text-white font-semibold">{researchResult.title}</span>.
                    </p>
                </div>

                <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-8">
                        {/* Topic Summary */}
                        <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Topic Context</h3>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                                {researchResult.deep_context.length > 250
                                    ? `${researchResult.deep_context.substring(0, 250)}...`
                                    : researchResult.deep_context}
                            </p>
                        </div>

                        {/* Guest Configuration */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Your Name (Guest)
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                                    <input
                                        type="text"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                    The AI host will address you by this name during the interview.
                                </p>
                            </div>

                            {/* Start Button */}
                            <button
                                onClick={handleStartInterview}
                                disabled={isGenerating || !userName.trim()}
                                className={`
                  w-full py-4 px-6 rounded-xl flex items-center justify-center gap-3 font-semibold text-lg transition-all
                  ${isGenerating || !userName.trim()
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]'
                                    }
                `}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Preparing Studio...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Start Interview Session
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="bg-slate-50 dark:bg-slate-900/40 px-8 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Powered by Deepgram + Perplexity + Deepseek</span>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Systems Operational
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

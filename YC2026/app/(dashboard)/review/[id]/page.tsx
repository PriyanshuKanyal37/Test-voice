'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { AssetCard } from '@/components/content/AssetCard';
import { AudioPlayer } from '@/components/content/AudioPlayer';
import { TranscriptViewer } from '@/components/content/TranscriptViewer';
import { Button } from '@/components/ui/Button';
import { useLinkedInGenerator } from '@/hooks/useLinkedInGenerator';
import type { ContentStatus } from '@/lib/types/content';
import type { TranscriptMessage } from '@/lib/types/transcript';

interface TranscriptSegment {
  speaker: string;
  content: string;
  startTime: number;
  endTime: number;
}

export default function ReviewPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(0);
  const [activeSegment, setActiveSegment] = useState<number | undefined>();
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  
  // Content states
  const [linkedInContent, setLinkedInContent] = useState('');
  const [linkedInStatus, setLinkedInStatus] = useState<ContentStatus>('generating');
  const [twitterContent, setTwitterContent] = useState('');
  const [twitterStatus, setTwitterStatus] = useState<ContentStatus>('generating');
  const [newsletterContent, setNewsletterContent] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<ContentStatus>('generating');

  const linkedInGenerator = useLinkedInGenerator();

  // Load data from sessionStorage
  useEffect(() => {
    const storedTopic = sessionStorage.getItem('interview-topic');
    const storedDuration = sessionStorage.getItem('interview-duration');
    const storedMessages = sessionStorage.getItem('interview-messages');

    if (storedTopic) setTopic(storedTopic);
    if (storedDuration) setDuration(parseInt(storedDuration, 10));

    if (storedMessages) {
      const messages: TranscriptMessage[] = JSON.parse(storedMessages);
      // Convert messages to segments with timestamps
      let currentTime = 0;
      const convertedSegments: TranscriptSegment[] = messages.map((msg, index) => {
        const segment = {
          speaker: msg.role === 'assistant' ? 'AI Host' : 'You',
          content: msg.content,
          startTime: currentTime,
          endTime: currentTime + 30, // Approximate 30 seconds per segment
        };
        currentTime += 30;
        return segment;
      });
      setSegments(convertedSegments);

      // Generate LinkedIn content
      const transcript = messages.map(m => 
        `${m.role === 'assistant' ? 'AI Host' : 'You'}: ${m.content}`
      ).join('\n\n');

      generateContent(storedTopic || 'General Discussion', transcript);
    } else {
      // Use mock data if no session data
      useMockData();
    }
  }, []);

  const generateContent = async (topicTitle: string, transcript: string) => {
    // Generate LinkedIn post
    try {
      const post = await linkedInGenerator.mutateAsync({
        topic: topicTitle,
        userName: 'Creator',
        transcript,
      });
      setLinkedInContent(post);
      setLinkedInStatus('ready');
    } catch (error) {
      // Use fallback content on error
      setLinkedInContent(getMockLinkedInContent());
      setLinkedInStatus('ready');
    }

    // Simulate Twitter and Newsletter generation
    setTimeout(() => {
      setTwitterContent(getMockTwitterContent());
      setTwitterStatus('ready');
    }, 2000);

    setTimeout(() => {
      setNewsletterContent(getMockNewsletterContent());
      setNewsletterStatus('ready');
    }, 3000);
  };

  const useMockData = () => {
    setTopic('AI Automation Strategies');
    setDuration(312);
    setSegments([
      {
        speaker: 'AI Host',
        content: 'Welcome! Today we\'re discussing AI automation strategies. What drew you to this topic?',
        startTime: 0,
        endTime: 30,
      },
      {
        speaker: 'You',
        content: 'I\'ve been working with automation tools for about 3 years now, and I\'ve seen how they\'ve transformed the way businesses operate. The key insight I\'ve gained is that automation isn\'t about replacing humans—it\'s about amplifying what humans do best.',
        startTime: 30,
        endTime: 90,
      },
      {
        speaker: 'AI Host',
        content: 'That\'s a fascinating perspective. Can you share a specific example of how automation amplified human capabilities rather than replacing them?',
        startTime: 90,
        endTime: 120,
      },
      {
        speaker: 'You',
        content: 'Absolutely. In my previous role, we automated all the repetitive data entry tasks. This freed up our team to focus on strategic analysis and client relationships. Our customer satisfaction scores went up by 40% because we had more time for meaningful conversations.',
        startTime: 120,
        endTime: 180,
      },
    ]);

    // Set mock content after delays
    setTimeout(() => {
      setLinkedInContent(getMockLinkedInContent());
      setLinkedInStatus('ready');
    }, 1500);

    setTimeout(() => {
      setTwitterContent(getMockTwitterContent());
      setTwitterStatus('ready');
    }, 2500);

    setTimeout(() => {
      setNewsletterContent(getMockNewsletterContent());
      setNewsletterStatus('ready');
    }, 3500);
  };

  const getMockLinkedInContent = () => `3 years of automating businesses.

The mistake everyone makes isn't the tool.

It's assuming automation means less work.

Here's what I've learned:

Automation doesn't replace humans. It amplifies them.

When we automated data entry at my previous company, something unexpected happened. Our customer satisfaction went up 40%.

Not because robots are better at relationships.

But because our team finally had TIME for meaningful conversations.

The ROI of automation isn't just efficiency.
It's human connection at scale.

Stop asking "What can I automate?"
Start asking "What should my humans focus on?"

The answer changes everything.

#Automation #AI #BusinessStrategy`;

  const getMockTwitterContent = () => `Thread: Why most automation strategies fail

1/ The biggest mistake in automation isn't choosing the wrong tool.

It's automating the wrong things.

2/ We automated our entire data entry workflow.
The result? 40% increase in customer satisfaction.

Not because robots are better than humans.
Because humans finally had time to be human.

3/ The question isn't "What can we automate?"

It's "What should our humans focus on?"

When you reframe automation as amplification, everything changes.`;

  const getMockNewsletterContent = () => `This week I want to share a counterintuitive insight about automation.

Most businesses approach automation backwards. They ask: "What tasks can we hand off to machines?"

But the real question is: "What tasks should our humans own?"

When we made this mental shift, our customer satisfaction jumped 40%. Not because our automation was better—but because it freed our team to do what humans do best: connect, empathize, and solve complex problems.

The takeaway: Automation is an amplifier, not a replacement.`;

  const handleSegmentClick = (time: number) => {
    const index = segments.findIndex(s => time >= s.startTime && time < s.endTime);
    setActiveSegment(index >= 0 ? index : undefined);
  };

  const handleRegenerate = async (platform: string) => {
    if (platform === 'linkedin') {
      setLinkedInStatus('generating');
      const storedMessages = sessionStorage.getItem('interview-messages');
      const storedTopic = sessionStorage.getItem('interview-topic') || topic;
      if (storedMessages) {
        const messages: TranscriptMessage[] = JSON.parse(storedMessages);
        const transcript = messages.map(m =>
          `${m.role === 'assistant' ? 'AI Host' : 'You'}: ${m.content}`
        ).join('\n\n');
        try {
          const post = await linkedInGenerator.mutateAsync({
            topic: storedTopic,
            userName: 'Creator',
            transcript,
          });
          setLinkedInContent(post);
        } catch {
          setLinkedInContent(getMockLinkedInContent());
        }
      }
      setLinkedInStatus('ready');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Pane: Transcript */}
        <div className="w-full md:w-2/5 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-white dark:bg-surface-dark">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-slate-900 dark:text-white">{topic}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Interview Transcript
            </p>
          </div>

          {/* Transcript */}
          <TranscriptViewer
            segments={segments}
            activeSegment={activeSegment}
            onSegmentClick={handleSegmentClick}
          />

          {/* Audio Player */}
          <AudioPlayer
            duration={duration}
            onTimestampClick={handleSegmentClick}
          />
        </div>

        {/* Right Pane: Generated Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Generated Content
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your content is ready to export
              </p>
            </div>
            <Button>
              <span className="material-symbols-outlined text-[20px]">ios_share</span>
              Export All
            </Button>
          </div>

          {/* Asset Cards */}
          <AssetCard
            platform="linkedin"
            status={linkedInStatus}
            content={linkedInContent}
            onRegenerate={() => handleRegenerate('linkedin')}
            onEdit={(newContent) => setLinkedInContent(newContent)}
          />

          <AssetCard
            platform="twitter"
            status={twitterStatus}
            content={twitterContent}
            onRegenerate={() => handleRegenerate('twitter')}
            onEdit={(newContent) => setTwitterContent(newContent)}
          />

          <AssetCard
            platform="newsletter"
            status={newsletterStatus}
            content={newsletterContent}
            onRegenerate={() => handleRegenerate('newsletter')}
            onEdit={(newContent) => setNewsletterContent(newContent)}
          />

          {/* Add New Asset Button */}
          <button className="w-full p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 dark:text-slate-500 hover:border-[#135bec] hover:text-[#135bec] transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">add_circle</span>
            Generate New Asset
          </button>
        </div>
      </div>
    </div>
  );
}

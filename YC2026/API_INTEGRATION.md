# API Integration Guide

Complete reference for integrating your backend APIs with the LadderFlow frontend.

## Table of Contents
1. [Trending Topics API](#trending-topics-api)
2. [TypeScript Types](#typescript-types)
3. [Error Handling](#error-handling)
4. [Loading States](#loading-states)

---

## Trending Topics API

### Endpoint Details
```
POST https://n8n.vonex.dpdns.org/webhook/d5d9a6e1-56e9-4a86-b197-5fa56f3a56e1
```

### Request
```typescript
{
  "keywords": string  // e.g., "n8n automation" or "AI, productivity, remote work"
}
```

### Response
```typescript
{
  "output": {
    "topics": [
      {
        "rank": 1,
        "topic_title": "From Tool User To Debugging Strategist",
        "global_context": "As automation platforms, low-code tools...",
        "why_this_matters": "Most learning content teaches where to click...",
        "key_questions": [
          "How do you train yourself or a team...",
          "What specific debugging rituals...",
          "How can companies design...",
          "What are the most common debugging anti-patterns...",
          "How does the rise of AI agents..."
        ],
        "source_tweet_id": "2005336131026755874"
      },
      // ... 4 more topics (rank 2-5)
    ]
  }
}
```

### Processing Time
- **Expected**: 5-15 seconds
- **Show loading state** with progress messages
- **Timeout**: Set to 30 seconds max

---

## TypeScript Types

Create `lib/types/trending.ts`:

```typescript
/**
 * Request payload for discovering trending topics
 */
export interface TrendingTopicsRequest {
  keywords: string;
}

/**
 * A single trending topic from the API
 */
export interface TrendingTopic {
  /** Ranking position (1-5) */
  rank: number;

  /** Main topic title */
  topic_title: string;

  /** Long-form context explaining the trend */
  global_context: string;

  /** Why this topic is valuable/relevant */
  why_this_matters: string;

  /** Array of 5 provocative questions about the topic */
  key_questions: string[];

  /** Source tweet ID for attribution */
  source_tweet_id: string;
}

/**
 * Full API response structure
 */
export interface TrendingTopicsResponse {
  output: {
    topics: TrendingTopic[];
  };
}

/**
 * UI state for a topic card
 */
export interface TopicCardState extends TrendingTopic {
  isSelected: boolean;
  isExpanded: boolean;
}
```

---

## API Client Implementation

### Option 1: Pure Fetch (Simple)

Create `lib/api/trending.ts`:

```typescript
import type { TrendingTopic, TrendingTopicsResponse } from '@/lib/types/trending';

const TRENDING_API_URL =
  'https://n8n.vonex.dpdns.org/webhook/d5d9a6e1-56e9-4a86-b197-5fa56f3a56e1';

/**
 * Discover trending topics based on keywords
 * @param keywords - Search keywords (can be comma-separated)
 * @returns Array of 5 ranked trending topics
 * @throws Error if API call fails
 */
export async function discoverTrendingTopics(
  keywords: string
): Promise<TrendingTopic[]> {
  // Input validation
  if (!keywords || keywords.trim().length === 0) {
    throw new Error('Keywords cannot be empty');
  }

  try {
    const response = await fetch(TRENDING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keywords: keywords.trim() }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data: TrendingTopicsResponse = await response.json();

    // Validate response structure
    if (!data.output?.topics || !Array.isArray(data.output.topics)) {
      throw new Error('Invalid API response structure');
    }

    return data.output.topics;
  } catch (error) {
    if (error instanceof Error) {
      // Network error, timeout, or API error
      console.error('Trending topics API error:', error.message);

      if (error.name === 'TimeoutError') {
        throw new Error('Request timed out. Please try again.');
      }

      throw new Error('Failed to discover trending topics. Please try again.');
    }

    throw error;
  }
}
```

### Option 2: React Query Hook (Recommended)

First, set up React Query in `app/providers.tsx`:

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 2,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

Then create hook `hooks/useTrendingTopics.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { discoverTrendingTopics } from '@/lib/api/trending';
import type { TrendingTopic } from '@/lib/types/trending';

interface UseTrendingTopicsOptions {
  keywords: string;
  enabled?: boolean;  // Whether to run the query
}

export function useTrendingTopics({ keywords, enabled = true }: UseTrendingTopicsOptions) {
  return useQuery<TrendingTopic[], Error>({
    queryKey: ['trending-topics', keywords],
    queryFn: () => discoverTrendingTopics(keywords),
    enabled: enabled && keywords.length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
```

---

## Usage Examples

### Example 1: Simple Page Component

```typescript
'use client';

import { useState } from 'react';
import { useTrendingTopics } from '@/hooks/useTrendingTopics';
import { TrendCard } from '@/components/trends/TrendCard';
import { Button } from '@/components/ui/Button';

export default function TrendingPage() {
  const [keywords, setKeywords] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: topics, isLoading, error, refetch } = useTrendingTopics({
    keywords: searchTerm,
    enabled: searchTerm.length > 0,
  });

  const handleSearch = () => {
    setSearchTerm(keywords);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin size-12 border-4 border-primary border-t-transparent rounded-full mb-4" />
        <p className="text-slate-600 animate-pulse">
          Analyzing conversations and discovering trends...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-red-500 mb-4">
          <span className="material-symbols-outlined text-5xl">error</span>
        </div>
        <p className="text-slate-900 font-semibold mb-2">Failed to load topics</p>
        <p className="text-slate-600 text-sm mb-4">{error.message}</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Search Input */}
      <div className="mb-8">
        <input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Enter keywords (e.g., AI automation, remote work)"
          className="w-full px-4 py-3 rounded-xl border border-slate-200"
        />
        <Button onClick={handleSearch} className="mt-2">
          Discover Topics
        </Button>
      </div>

      {/* Results Grid */}
      {topics && topics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topics.map((topic) => (
            <TrendCard key={topic.rank} topic={topic} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Example 2: With Selection State

```typescript
'use client';

import { useState } from 'react';
import { useTrendingTopics } from '@/hooks/useTrendingTopics';
import { TrendCard } from '@/components/trends/TrendCard';

export default function TopicSelectionPage() {
  const [keywords, setKeywords] = useState('AI automation');
  const [selectedRanks, setSelectedRanks] = useState<number[]>([]);

  const { data: topics, isLoading } = useTrendingTopics({
    keywords,
    enabled: true,
  });

  const handleToggle = (rank: number) => {
    setSelectedRanks((prev) =>
      prev.includes(rank)
        ? prev.filter((r) => r !== rank)
        : [...prev, rank]
    );
  };

  const selectedTopics = topics?.filter((t) => selectedRanks.includes(t.rank)) || [];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topics?.map((topic) => (
          <TrendCard
            key={topic.rank}
            topic={topic}
            isSelected={selectedRanks.includes(topic.rank)}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {/* Sticky Bottom Bar */}
      {selectedRanks.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t p-4">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div>
              <span className="font-bold">{selectedRanks.length} Topics Selected</span>
              <button
                onClick={() => setSelectedRanks([])}
                className="ml-4 text-sm text-slate-500 hover:text-slate-800"
              >
                Clear selection
              </button>
            </div>
            <button className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold">
              Create Interview
            </button>
          </div>
        </div>
      )}
    </>
  );
}
```

---

## Error Handling

### Common Error Scenarios

```typescript
// 1. Network Error (No Internet)
try {
  await discoverTrendingTopics('AI');
} catch (error) {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    // Show: "No internet connection. Please check your network."
  }
}

// 2. Timeout (> 30 seconds)
// Caught automatically with AbortSignal.timeout(30000)
// Show: "Request timed out. The API might be experiencing high load."

// 3. API Error (500, 503)
// Show: "Our service is temporarily unavailable. Please try again in a moment."

// 4. Invalid Keywords (Empty)
// Show: "Please enter at least one keyword to discover topics."

// 5. Malformed Response
// Show: "Unexpected response format. Please contact support if this persists."
```

### Error Boundary Component

```typescript
// components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <p className="text-red-600 font-semibold">Something went wrong</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Loading States

### Progressive Loading Messages

Enhance UX by showing different messages during the wait:

```typescript
import { useState, useEffect } from 'react';

function useLoadingMessage() {
  const messages = [
    'Analyzing conversations...',
    'Discovering emerging trends...',
    'Evaluating topic relevance...',
    'Ranking results...',
  ];

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return messages[messageIndex];
}

// Usage
export function LoadingState() {
  const message = useLoadingMessage();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      {/* Waveform Animation */}
      <div className="flex items-center gap-1 mb-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="w-1 bg-primary rounded-full animate-pulse"
            style={{
              height: `${Math.random() * 40 + 20}px`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
      <p className="text-slate-600 font-medium">{message}</p>
    </div>
  );
}
```

---

## Testing

### Mock Data for Development

```typescript
// lib/api/__mocks__/trending.ts
import type { TrendingTopic } from '@/lib/types/trending';

export const mockTrendingTopics: TrendingTopic[] = [
  {
    rank: 1,
    topic_title: 'From Tool User To Debugging Strategist',
    global_context: 'As automation platforms become embedded in operations...',
    why_this_matters: 'Most learning content teaches where to click, but nobody teaches debugging.',
    key_questions: [
      'How do you train yourself to think like a debugger?',
      'What debugging rituals separate pros from casual builders?',
      'How can companies design observable automation?',
      'What are common debugging anti-patterns?',
      'How does AI change debugging approaches?',
    ],
    source_tweet_id: '2005336131026755874',
  },
  // ... add more mock topics
];

export async function discoverTrendingTopics(keywords: string): Promise<TrendingTopic[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return mockTrendingTopics;
}
```

Use in development:

```typescript
// Toggle between real and mock API
const USE_MOCK_API = process.env.NODE_ENV === 'development';

import { discoverTrendingTopics } from USE_MOCK_API
  ? '@/lib/api/__mocks__/trending'
  : '@/lib/api/trending';
```

---

## Voice Agent & Content Generation APIs

**Base URL**: `https://voice-agent-1jao.onrender.com`

---

### 2. Health Check

```typescript
GET /health
```

**Response**:
```typescript
{
  "status": "ok"
}
```

**Usage**:
```typescript
// Check if backend is available
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch('https://voice-agent-1jao.onrender.com/health');
    const data = await response.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}
```

---

### 3. Generate Agent Configuration (Voice Interview Setup)

```typescript
POST /agent-config
```

**Purpose**: Builds a complete Deepgram Voice Agent configuration from topic data. Uses LangGraph to generate a dynamic interview system prompt.

**TypeScript Types**:
```typescript
// lib/types/agent.ts
export interface AgentConfigRequest {
  topic: string;                    // Required
  userName?: string;                // Default: 'Guest'
  topic_title?: string;             // Overrides topic if provided
  global_context?: string;          // Industry context
  why_this_matters?: string;        // Relevance explanation
  key_questions?: string[];         // Research-backed questions
}

export interface DeepgramConfig {
  type: 'Settings';
  audio: {
    input: {
      encoding: 'linear16';
      sample_rate: 16000;
    };
    output: {
      encoding: 'linear16';
      sample_rate: 24000;
      container: 'none';
    };
  };
  agent: {
    language: 'en';
    greeting: string;
    listen: {
      provider: {
        type: 'deepgram';
        model: 'nova-3';
      };
    };
    think: {
      provider: {
        type: 'open_ai';
        model: 'gpt-4o-mini';
      };
      prompt: string;
    };
    speak: {
      provider: {
        type: 'deepgram';
        model: 'aura-2-thalia-en';
      };
    };
  };
}

export interface AgentConfigResponse {
  systemPrompt: string;
  topicTitle: string;
  userName: string;
  deepgramConfig: DeepgramConfig;
}
```

**API Client**:
```typescript
// lib/api/agent.ts
const BASE_URL = 'https://voice-agent-1jao.onrender.com';

export async function generateAgentConfig(
  request: AgentConfigRequest
): Promise<AgentConfigResponse> {
  const response = await fetch(`${BASE_URL}/agent-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Agent config generation failed: ${response.status}`);
  }

  return await response.json();
}
```

**Usage Example**:
```typescript
// When user selects topics and starts interview
import { generateAgentConfig } from '@/lib/api/agent';

// From Screen 2: User selected a trending topic
const selectedTopic = {
  rank: 1,
  topic_title: "From Tool User To Debugging Strategist",
  global_context: "As automation platforms become...",
  why_this_matters: "Most learning content teaches...",
  key_questions: ["How do you train...", "..."]
};

// Generate agent config
const config = await generateAgentConfig({
  topic: selectedTopic.topic_title,
  userName: "Alex Chen",
  topic_title: selectedTopic.topic_title,
  global_context: selectedTopic.global_context,
  why_this_matters: selectedTopic.why_this_matters,
  key_questions: selectedTopic.key_questions,
});

// Use config.deepgramConfig to initialize Deepgram WebSocket
// Use config.systemPrompt to show user what AI knows
```

---

### 4. Format Transcript

```typescript
POST /transcript
```

**Purpose**: Formats raw conversation messages into a readable transcript. Call when the interview session ends.

**TypeScript Types**:
```typescript
// lib/types/transcript.ts
export interface TranscriptMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface TranscriptRequest {
  topic?: string;           // Default: 'General Discussion'
  userName?: string;        // Default: 'Guest'
  messages: TranscriptMessage[];  // From Deepgram ConversationText events
  duration?: number;        // Session length in seconds
}

export interface TranscriptResponse {
  success: boolean;
  topic: string;
  userName: string;
  duration: string;         // e.g., "5 min 12 sec"
  transcript: string;       // Formatted with speaker labels
  content: {
    linkedin: string;       // Empty (placeholder)
    twitter: string;        // Empty (placeholder)
  };
}
```

**API Client**:
```typescript
// lib/api/transcript.ts
export async function formatTranscript(
  request: TranscriptRequest
): Promise<TranscriptResponse> {
  const response = await fetch(`${BASE_URL}/transcript`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Transcript formatting failed: ${response.status}`);
  }

  return await response.json();
}
```

**Usage Example**:
```typescript
// Screen 3: After voice interview ends
const messages: TranscriptMessage[] = [
  { role: 'assistant', content: 'Welcome! Tell me about your background.' },
  { role: 'user', content: 'I've been automating businesses for 3 years...' },
  { role: 'assistant', content: 'Interesting. What's the biggest challenge?' },
  // ... collected from Deepgram WebSocket events
];

const transcript = await formatTranscript({
  topic: "AI Automation Strategy",
  userName: "Sarah Chen",
  messages: messages,
  duration: 312, // 5 minutes 12 seconds
});

console.log(transcript.transcript);
// Output:
// Sarah Chen: I've been automating businesses for 3 years...
//
// Alex (AI Host): Interesting. What's the biggest challenge?
```

---

### 5. Generate LinkedIn Post

```typescript
POST /generate-linkedin
```

**Purpose**: Generates a viral LinkedIn post from the transcript using GPT-4o. Optimized based on 10k+ high-engagement posts.

**TypeScript Types**:
```typescript
// lib/types/content.ts
export interface LinkedInGenerationRequest {
  topic: string;
  userName?: string;  // Default: 'Guest'
  transcript: string;
}

export interface LinkedInGenerationResponse {
  linkedin: string;  // 200-350 words, max 3 hashtags, no bullet points
}
```

**API Client**:
```typescript
// lib/api/content.ts
export async function generateLinkedInPost(
  request: LinkedInGenerationRequest
): Promise<string> {
  const response = await fetch(`${BASE_URL}/generate-linkedin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`LinkedIn generation failed: ${response.status}`);
  }

  const data: LinkedInGenerationResponse = await response.json();
  return data.linkedin;
}
```

**Usage Example**:
```typescript
// Screen 4: Generate LinkedIn post from transcript
const linkedInPost = await generateLinkedInPost({
  topic: "AI Automation Strategy",
  userName: "Sarah Chen",
  transcript: formattedTranscript.transcript,
});

console.log(linkedInPost);
// Output:
// 3 years automating businesses.
//
// The mistake everyone makes isn't the tool.
//
// It's assuming automation means less work.
// ...
```

---

## Complete Flow: Topic Discovery → Voice Interview → Content Generation

### Step-by-Step Integration

```typescript
// 1. SCREEN 1 & 2: Discover Trending Topics
const topics = await discoverTrendingTopics('AI automation');
const selectedTopic = topics[0]; // User selects rank 1

// 2. SCREEN 3: Start Voice Interview
const agentConfig = await generateAgentConfig({
  topic: selectedTopic.topic_title,
  userName: userProfile.name,
  topic_title: selectedTopic.topic_title,
  global_context: selectedTopic.global_context,
  why_this_matters: selectedTopic.why_this_matters,
  key_questions: selectedTopic.key_questions,
});

// Initialize Deepgram WebSocket with agentConfig.deepgramConfig
const messages: TranscriptMessage[] = [];

deepgramSocket.on('ConversationText', (event) => {
  messages.push({
    role: event.role, // 'user' or 'assistant'
    content: event.content,
  });
});

// 3. Interview completes, user clicks "End"
const interviewDuration = calculateDuration(); // in seconds

const transcript = await formatTranscript({
  topic: selectedTopic.topic_title,
  userName: userProfile.name,
  messages: messages,
  duration: interviewDuration,
});

// 4. SCREEN 4: Generate Content
const linkedInPost = await generateLinkedInPost({
  topic: selectedTopic.topic_title,
  userName: userProfile.name,
  transcript: transcript.transcript,
});

// Display in content review screen
setContent({
  linkedin: linkedInPost,
  twitter: '', // Future: Add Twitter endpoint
  newsletter: '', // Future: Add Newsletter endpoint
});
```

---

## React Query Hooks

### Hook: useAgentConfig

```typescript
// hooks/useAgentConfig.ts
import { useMutation } from '@tanstack/react-query';
import { generateAgentConfig } from '@/lib/api/agent';
import type { AgentConfigRequest } from '@/lib/types/agent';

export function useAgentConfig() {
  return useMutation({
    mutationFn: (request: AgentConfigRequest) => generateAgentConfig(request),
    onError: (error) => {
      console.error('Failed to generate agent config:', error);
    },
  });
}

// Usage in component
const { mutate: createAgentConfig, isPending, data: config } = useAgentConfig();

createAgentConfig({
  topic: "AI Automation",
  userName: "Alex",
});
```

### Hook: useTranscriptFormatter

```typescript
// hooks/useTranscriptFormatter.ts
import { useMutation } from '@tanstack/react-query';
import { formatTranscript } from '@/lib/api/transcript';
import type { TranscriptRequest } from '@/lib/types/transcript';

export function useTranscriptFormatter() {
  return useMutation({
    mutationFn: (request: TranscriptRequest) => formatTranscript(request),
  });
}
```

### Hook: useLinkedInGenerator

```typescript
// hooks/useLinkedInGenerator.ts
import { useMutation } from '@tanstack/react-query';
import { generateLinkedInPost } from '@/lib/api/content';
import type { LinkedInGenerationRequest } from '@/lib/types/content';

export function useLinkedInGenerator() {
  return useMutation({
    mutationFn: (request: LinkedInGenerationRequest) => generateLinkedInPost(request),
    retry: 2, // GPT-4o can occasionally timeout
  });
}

// Usage
const { mutate: generatePost, isPending, data: linkedInPost } = useLinkedInGenerator();

generatePost({
  topic: "AI Automation",
  userName: "Sarah",
  transcript: "...",
});
```

---

## Environment Variables

Update your `.env.local`:

```bash
# Backend API
NEXT_PUBLIC_BACKEND_URL=https://voice-agent-1jao.onrender.com

# Trending Topics API (N8N)
NEXT_PUBLIC_TRENDING_API_URL=https://n8n.vonex.dpdns.org/webhook/d5d9a6e1-56e9-4a86-b197-5fa56f3a56e1

# Deepgram (for WebSocket connection)
NEXT_PUBLIC_DEEPGRAM_API_KEY=your_key_here
```

---

## Error Handling

All endpoints return standard HTTP errors:

```typescript
// Generic error handler
async function apiCall<T>(url: string, options: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
}
```

---

## Notes

1. **OpenAI API Key**: The backend requires `OPENAI_API_KEY` for LinkedIn generation and as the LLM provider inside Deepgram agent config.

2. **Content Placeholders**: The `/transcript` endpoint returns empty strings for `content.linkedin` and `content.twitter`. Use the separate `/generate-linkedin` endpoint to generate actual content.

3. **Deepgram WebSocket**: The `deepgramConfig` from `/agent-config` should be sent directly to Deepgram's WebSocket as the initial Settings message.

4. **Duration Formatting**: The `/transcript` endpoint automatically formats duration from seconds to "X min Y sec".

5. **LinkedIn Post Style**:
   - 200-350 words
   - No bullet points
   - Max 3 hashtags
   - Optimized for viral engagement

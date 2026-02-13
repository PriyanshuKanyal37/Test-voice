# LadderFlow Frontend Development Guide

## Project Overview
LadderFlow is a "Human-First" content engine that transforms raw verbal insights into multi-modal content (Text, Carousels, Reels) through voice-first interaction. This README serves as the source of truth for frontend development.

---

## Tech Stack

### Core Framework
- **Next.js 14+** (App Router)
- **React 18+**
- **TypeScript** (strict mode enabled)
- **Tailwind CSS** for styling

### Key Integrations
- **Supabase** - Authentication, Database, Vector Storage
- **Deepgram** - Speech-to-Text, Text-to-Speech (Aura-2 for <200ms latency)
- **Whisper** - Fallback STT
- **HeyGen/Synthesia API** - Avatar video generation
- **Submagic/VEED API** - Faceless reel generation
- **Pinecone/Supabase Vector** - AI Twin memory layer

### State Management
- React Context + Hooks for global state
- Consider Zustand for complex state (trend data, session memory)

---

## Screen-by-Screen Implementation Guide

### Screen 1: Topic Discovery Input
**File**: `png-samples/topic_discovery_input/`

**Layout**:
- Centered single-column layout (max-width: 640px)
- Large heading: "What do you want to talk about today?"
- Subtitle: "Enter 3-5 keywords separated by commas to get started"
- White card with shadow containing textarea input
- Large primary CTA button at bottom

**Key Components**:
```tsx
// Large textarea with icon
- Textarea: min-h-[200px], placeholder styling
- Edit icon (Material Symbol) positioned absolute top-left
- Bottom helper row showing "KEYWORDS" label and "Comma separated" badge
- Primary button: Full width, with arrow_forward icon, hover effects

// Ambient background
- Fixed gradient blob: w-[800px] h-[800px] bg-primary/5 blur-[100px]
```

**Interactions**:
- Auto-focus on textarea
- Button shows subtle shine animation on hover
- Helper text at bottom: "We'll analyze conversations to generate unique ideas"

---

### Screen 2: Trending Topic Selection
**File**: `png-samples/trending_topic_selection/`

**Layout**:
- Page header with title + search bar
- 2-column grid of topic cards (responsive: 1 col mobile, 2 col desktop)
- Sticky bottom bar showing selection count + CTA

**IMPORTANT - Actual vs Mockup**:
The PNG mockup shows engagement metrics (likes, comments, shares), but the **real API** returns:
- `rank` (1-5)
- `topic_title`
- `why_this_matters` (use as card description)
- `global_context` (show on expand/detail view)
- `key_questions[]` (show on expand/detail view)

**Key Components**:
```tsx
// Topic Cards (2 states: Selected vs Unselected)
Selected State:
- border-2 border-primary
- shadow-glow
- Checkmark badge (top-right, bg-primary with check icon)
- Rank badge (top-left, "Rank #1")
- Title (topic_title)
- Description (why_this_matters, line-clamp-3)
- "View Questions" button to expand

Unselected State:
- border border-slate-200
- Empty circle badge (top-right, appears on hover)
- Rank badge (grayscale)
- Hover: border-primary/50, -translate-y-1

Expanded State (Modal or Accordion):
- Full global_context
- All 5 key_questions as bullet list
- source_tweet_id link

// Bottom Sticky Bar
- Shows "2 Topics Selected" with numbered badge
- "Clear selection" link
- Primary CTA: "Create Interview" button
```

**Data to Display**:
```typescript
interface TopicCard {
  rank: number;              // Display as "Rank #1"
  topic_title: string;       // Main heading
  why_this_matters: string;  // Card description (line-clamp-3)
  global_context: string;    // Show in expanded view
  key_questions: string[];   // Show in expanded view (5 items)
  source_tweet_id: string;   // Optional link
  isSelected: boolean;       // UI state
}
```

**Note**: The PNG mockup category filters (Technology, Business, etc.) are **not** provided by the API. Either:
- Remove category chips, OR
- Implement client-side filtering/tags based on topic content

---

### Screen 3: Live Voice Interview
**File**: `png-samples/live_voice_interview/`

**Layout**:
- Top bar: Logo + "Live Connection" badge + Progress pill + Timer
- Center: Waveform visualization with "ACTIVE LISTENING" label
- Transcript area: Conversation bubbles (AI questions + User responses)
- Bottom: Floating control dock (Pause, Mic, End buttons)

**API Integration**:
```typescript
// 1. Initialize interview session
POST https://voice-agent-1jao.onrender.com/agent-config

Request: {
  topic: string,
  userName: string,
  topic_title: string,
  global_context: string,
  why_this_matters: string,
  key_questions: string[]
}

Response: {
  systemPrompt: string,
  deepgramConfig: { /* Send to Deepgram WebSocket */ }
}

// 2. Connect to Deepgram WebSocket
// Use deepgramConfig from step 1 as initial Settings message

// 3. Collect messages during interview
messages: Array<{ role: 'user' | 'assistant', content: string }>
```

**Key Components**:
```tsx
// Live Connection Badge
- Pulsing green dot animation
- "Live Connection" text

// Waveform Visualization
- 18 vertical bars with varying heights (6px width, rounded-full)
- Animated (CSS transition on height)
- Glowing background effect (bg-primary/20 blur-[60px])

// Conversation Transcript
- AI messages: White/dark card with primary accent, robot icon
- User messages: Border-left style, "RECORDING" badge
- Streaming text with animated cursor (|)
- Faded previous messages (opacity-40)

// Bottom Control Dock
- Floating rounded-2xl card with backdrop-blur
- Center: Large mic button (size-20) with pulse animation
- Side buttons: Pause (pause_circle icon), End (call_end icon)
- Mobile-optimized touch targets
```

**Real-time Features**:
- WebSocket connection for live transcript updates
- Waveform bars animate based on audio input
- Auto-scroll transcript to bottom as new text appears
- Show typing indicator (blinking cursor) during user speech

---

### Screen 4: Content Review & Export
**File**: `png-samples/content_review_&_export/`

**Layout**:
- Split pane: 40% left (Source Audio) / 60% right (Generated Assets)
- Left: Transcript with sticky audio player at bottom
- Right: Scrollable cards for each content type

**API Integration**:
```typescript
// 1. Format transcript when interview ends
POST https://voice-agent-1jao.onrender.com/transcript

Request: {
  topic: string,
  userName: string,
  messages: Array<{ role: 'user' | 'assistant', content: string }>,
  duration: number  // seconds
}

Response: {
  success: boolean,
  transcript: string,  // Formatted with speaker labels
  duration: string     // "5 min 12 sec"
}

// 2. Generate LinkedIn post
POST https://voice-agent-1jao.onrender.com/generate-linkedin

Request: {
  topic: string,
  userName: string,
  transcript: string  // From step 1
}

Response: {
  linkedin: string  // 200-350 words, max 3 hashtags
}

// Future: Add Twitter thread, Newsletter, Carousel, Video generation
```

**Key Components**:
```tsx
// Left Pane - Transcript
- Speaker labels with timestamps
- Highlighted active segment (bg-primary/5, border-l-4 border-primary)
- Clickable segments (hover:bg-slate-50)

// Sticky Audio Player
- Waveform visualization (mini version)
- Controls: Replay 10s, Play/Pause, Forward 10s
- Speed control (1.0x badge)
- Volume slider
- Time display (font-mono)

// Right Pane - Asset Cards
Card Structure:
- Header: Platform icon + name + status badge (Ready/Generating)
- Actions: Regenerate, Copy, Edit icons
- Content: Editable textarea OR loading skeleton
- States: Ready (white bg), Generating (animated pulse)

Platform Cards:
1. LinkedIn Post (blue "in" logo)
2. Twitter Thread (black "X" logo, shows multiple tweets)
3. Newsletter Blurb (orange mail icon)

// Loading State (Newsletter card example)
- Skeleton: h-4 bg-slate-100 rounded w-[percentage] animate-pulse
- Badge: "Generating..." with pulsing dot
```

**Interactions**:
- Click transcript segment → Jump audio to that timestamp
- Edit content inline (textarea auto-resize)
- Copy button → Copy to clipboard with toast notification
- Regenerate → Show loading state, replace content
- "Generate New Asset" button at bottom (dashed border, add_circle icon)

---

### Screen 5: Content Creator Dashboard
**File**: `png-samples/content_creator_dashboard/`

**Layout**:
- Left sidebar (hidden on mobile, 256px width desktop)
- Main content area with hero card + sessions table
- Sidebar navigation: Dashboard (active), Sessions, Templates, Settings

**Key Components**:
```tsx
// Sidebar
- Logo area (8x8 icon + brand name)
- Navigation items (icon + label)
- Active state: bg-white shadow-sm border
- Hover state: bg-slate-200/50
- Bottom: User profile card with avatar + name + plan badge

// Hero Card (Create New Session CTA)
- Left: Content (badge + heading + description + CTA button)
- Right: Decorative image (abstract sound waves)
- Badge: "Voice AI 2.0" with mic icon
- Gradient background on image area

// Recent Sessions Table
- Header row (desktop only): Session Title, Tags, Actions
- Session rows:
  - Colored avatar icon (category-specific)
  - Title + timestamp + duration
  - Tag badges (colored by category)
  - Hover actions: "View Content" button + Copy icon
- Hover effect: bg-[#F7F7F8], opacity reveal for actions

// Search Bar
- Icon inside input (search icon)
- Focus state: border-primary, ring-4 ring-primary/10
```

**Session Row Data**:
- Icon color + type (mic, lightbulb, coffee, campaign)
- Title + date + duration
- Tags (multiple, different colors)
- Actions: View Content, Duplicate (copy icon)

---

## Core Features & User Flows

### 1. Trend Discovery Engine
**Purpose**: Help creators find viral opportunities and content gaps

**UI Components Needed**:
- Keyword input field (3-5 keywords max)
- Platform selector (LinkedIn, X, Instagram, Medium)
- Loading state with engaging animations
- Results display: 5-10 "Provocative Angles" cards
- Ability to select angle(s) for content creation

**API Endpoints**:
```typescript
// POST Request
POST https://n8n.vonex.dpdns.org/webhook/d5d9a6e1-56e9-4a86-b197-5fa56f3a56e1

Body: {
  "keywords": string  // e.g., "n8n automation"
}

// Response Structure
interface TrendingTopicsResponse {
  output: {
    topics: Array<{
      rank: number;
      topic_title: string;
      global_context: string;        // Long-form context
      why_this_matters: string;      // Value proposition
      key_questions: string[];       // 5 provocative questions
      source_tweet_id: string;
    }>;
  };
}
```

**UX Considerations**:
- Show real-time progress ("Analyzing conversations...")
- Display loading state while API processes (typically 5-15 seconds)
- Show 5 ranked topics as cards
- Each card shows: title, why_this_matters (as description), rank badge
- Click to expand → Show full global_context + key_questions
- Quick action: "Use This Topic" → flows into outline generation

---

### 2. AI Twin / Digital Brain
**Purpose**: Persistent memory system that learns user's voice, frameworks, and stories

**UI Components Needed**:
- Visual knowledge graph (consider using D3.js or Recharts)
- Session history timeline
- "Framework Library" - cards showing saved frameworks
- "Voice Fingerprint" visualization (optional but cool)
- Context panel during interviews ("Last month you mentioned...")

**API Endpoints**:
- `GET /api/brain/context` - Fetch user's knowledge graph
- `POST /api/brain/update` - Store new frameworks/insights
- `GET /api/brain/sessions` - Historical sessions

**UX Considerations**:
- Make the "brain" feel tangible (animated nodes on updates)
- Show how past context influences current content
- Privacy controls: "What does my AI Twin remember?"

---

### 3. AI Podcaster Interface (Provocateur Mode)
**Purpose**: Voice-first content capture with low-latency, conversational AI

**UI Components Needed**:
- Large, central "Record" button (think Clubhouse/Voice Memos)
- Real-time waveform visualization
- AI response bubbles (text + audio playback)
- Latency indicator (<200ms badge)
- "Skip" / "Dig Deeper" quick actions
- Transcript panel (live updating)

**API Endpoints**:
- WebSocket connection for real-time voice streaming
- `POST /api/interview/start` - Initialize session
- `POST /api/interview/respond` - Send audio chunk, get AI response
- `POST /api/interview/end` - Finalize and process

**UX Considerations**:
- **Critical**: Maintain <200ms latency feel (optimistic UI updates)
- Show AI "thinking" states without lag perception
- Mobile-first: Large touch targets, portrait orientation
- Visual cues when AI wants user to elaborate ("Tell me more about...")
- Progress indicator: "2/5 questions answered"

---

### 4. Multi-Modal Content Engine

#### 4A. Text Content Generator
**Outputs**: LinkedIn posts, X threads, Medium articles

**UI Components Needed**:
- Platform tabs (LinkedIn / X / Medium)
- Live preview panel with platform-accurate styling
- Copy-to-clipboard buttons
- "Regenerate Hook" / "Make it Spicier" controls
- Character count (platform-specific limits)
- Scheduled post calendar integration (future)

**API Endpoints**:
- `POST /api/content/text/generate` - Generate text content
- `PUT /api/content/text/{id}/refine` - Iterate on content

#### 4B. Carousel Generator
**Outputs**: Instagram/LinkedIn 5-10 slide carousels

**UI Components Needed**:
- Slide-by-slide editor (Swiper.js or Embla Carousel)
- Template selector (minimal, bold, data-viz)
- Per-slide text editor
- Visual layout suggestions (icon placement, color schemes)
- Export options (PNG sequence, PDF, Canva link)

**API Endpoints**:
- `POST /api/content/carousel/generate` - Generate carousel structure
- `GET /api/content/carousel/{id}/export` - Download assets

**UX Considerations**:
- Show mobile preview (since carousels are mobile-native)
- Quick "Use Template X" for brand consistency
- Accessibility: Ensure text contrast ratios

#### 4C. Video Generator (Faceless + Avatar Reels)
**Outputs**: Short-form vertical videos

**UI Components Needed**:
- Video preview player
- Style selector: Faceless (B-roll + captions) vs. Avatar (talking head)
- Customization panel:
  - Caption style (font, color, animation)
  - B-roll category (tech, nature, abstract)
  - Emoji density slider
- Rendering queue with progress bars
- Download + direct-to-platform publish

**API Endpoints**:
- `POST /api/content/video/faceless` - Generate faceless reel
- `POST /api/content/video/avatar` - Generate avatar reel (credit-based)
- `GET /api/content/video/{jobId}/status` - Poll rendering status

**UX Considerations**:
- **Critical**: Show credit usage for avatar videos (since it's expensive)
- Processing time estimates: "~90 seconds remaining"
- Auto-save drafts (in case user navigates away)
- Preview on mobile aspect ratio (9:16)

---

### 5. Dashboard & Analytics
**Purpose**: Show content performance and usage stats

**UI Components Needed**:
- Weekly content calendar view
- Engagement metrics (if integrated with social APIs)
- Credits remaining (for video generation)
- "Content Health Score" (variety across text/visual/video)
- Quick actions: "Create This Week's Content"

**API Endpoints**:
- `GET /api/dashboard/stats` - Usage and performance data
- `GET /api/dashboard/calendar` - Scheduled/published content

---

## Design System (From PNG Samples)

### Color Palette
```css
--primary: #135bec          /* Main brand blue */
--background-light: #f6f6f8 /* Light mode background */
--background-dark: #101622  /* Dark mode background */
--surface-light: #ffffff    /* Cards/surfaces in light mode */
--surface-dark: #1a2230     /* Cards/surfaces in dark mode */
```

### Typography
- **Font Family**: Inter (weights: 300, 400, 500, 600, 700, 900)
- **Headings**: Bold to Black weights (700-900)
- **Body**: Regular to Medium (400-500)
- **Small Text**: Use 12px-14px for labels, metadata

### Border Radius
- Default: `0.5rem` (8px)
- Large: `1rem` (16px)
- Extra Large: `1.5rem` (24px)
- Full: `9999px` (pills/circles)

### Spacing Scale
- Use Tailwind's default spacing (4px increments)
- Component padding: `p-6` (24px) for cards
- Section gaps: `gap-6` to `gap-8`

### Icons
- **Library**: Material Symbols Outlined
- **Sizes**: 18px (small), 20px (default), 24px (large), 32px (hero)
- **Fill variation**: Use `filled` class for selected states

### Shadows
- Cards: `shadow-sm` to `shadow-md`
- Primary buttons: `shadow-lg shadow-primary/30`
- Active elements: `shadow-glow` (custom: `0 0 20px rgba(19, 91, 236, 0.15)`)

---

## Design Principles for Vibecoding

### 1. Mobile-First, Always
- Start with mobile layout (375px width)
- Touch targets minimum 44x44px
- Voice recording must work flawlessly on iOS Safari + Android Chrome
- Use `hidden md:flex` pattern for desktop-only navigation

### 2. Latency is the Enemy
- Optimistic UI updates (assume API success, rollback on error)
- Skeleton loaders for <500ms waits (see Newsletter Blurb card example)
- Real-time feedback for voice interactions (<200ms perceived delay)
- Use `React.useTransition()` for non-urgent updates
- Show "RECORDING" badges and animated waveforms immediately

### 3. Avoid "AI Slop" Aesthetics
- No generic gradient backgrounds or robot emojis
- Use subtle blur effects (`blur-[60px]` for ambient glows)
- Authentic copy (no "Unlock your potential!" clichés)
- Show real user content in demos, not Lorem Ipsum
- Waveform visualizations instead of generic AI imagery

### 4. Radical Simplicity
- Each screen should have ONE primary action (large, centered)
- Minimize cognitive load: Trend → Outline → Interview → Content
- Progressive disclosure: Hide advanced settings behind "Customize"
- Use breadcrumbs for navigation context (see Content Review screen)

### 5. Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation for all interactions
- Screen reader labels (`sr-only` class for hidden labels)
- Color contrast ratios: 4.5:1 minimum
- ARIA labels for waveform visualizations

---

## Component Architecture

### Suggested Folder Structure
```
app/
├── (auth)/
│   ├── login/
│   └── signup/
├── (dashboard)/
│   ├── page.tsx                    # Main dashboard (Screen 5)
│   ├── discover/
│   │   ├── page.tsx                # Topic input (Screen 1)
│   │   └── trending/page.tsx       # Topic selection (Screen 2)
│   ├── interview/
│   │   └── [sessionId]/page.tsx    # Live interview (Screen 3)
│   ├── review/
│   │   └── [sessionId]/page.tsx    # Content review (Screen 4)
│   └── brain/
└── api/
    └── (all API route handlers)

components/
├── ui/              # Reusable UI primitives
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── Badge.tsx
│   ├── Card.tsx
│   └── Skeleton.tsx
├── layout/
│   ├── Navbar.tsx              # Top navigation bar (consistent across screens)
│   ├── Sidebar.tsx             # Dashboard sidebar (Screen 5)
│   └── PageHeader.tsx          # Page title + breadcrumbs pattern
├── trends/
│   ├── KeywordInput.tsx        # Large textarea with helper text (Screen 1)
│   ├── TrendCard.tsx           # Selectable topic cards (Screen 2)
│   ├── CategoryChips.tsx       # Horizontal filter chips (Screen 2)
│   └── TrendGrid.tsx           # Responsive 2-col grid wrapper
├── interview/
│   ├── VoiceRecorder.tsx       # Main recording interface
│   ├── Waveform.tsx            # Animated audio bars (Screen 3)
│   ├── TranscriptMessage.tsx   # Single AI/User message bubble
│   ├── TranscriptPanel.tsx     # Full conversation stream
│   ├── ControlDock.tsx         # Bottom floating controls (Screen 3)
│   └── StatusBadge.tsx         # Live Connection / Recording badges
├── content/
│   ├── AssetCard.tsx           # Platform content card (Screen 4)
│   ├── AudioPlayer.tsx         # Sticky player with waveform (Screen 4)
│   ├── TranscriptViewer.tsx    # Left pane transcript (Screen 4)
│   ├── EditableContent.tsx     # Textarea with auto-resize
│   └── LoadingSkeleton.tsx     # Pulse animation for generating state
├── dashboard/
│   ├── HeroCard.tsx            # Create New Session CTA (Screen 5)
│   ├── SessionRow.tsx          # Single session in table (Screen 5)
│   └── SessionsTable.tsx       # Full table with search (Screen 5)
└── shared/
    ├── AmbientGlow.tsx         # Reusable blur background effect
    └── IconWrapper.tsx         # Colored icon containers

lib/
├── supabase/        # Client initialization
├── deepgram/        # Voice streaming logic
├── api-client.ts    # Axios/Fetch wrapper
└── utils.ts         # cn() helper, formatters, etc.
```

### Key Reusable Components to Build First

#### 1. Waveform Component
**Used in**: Screen 3 (Live Interview), Screen 4 (Audio Player)

```tsx
// components/interview/Waveform.tsx
interface WaveformProps {
  isActive?: boolean;      // Animate bars when true
  barCount?: number;       // Default 18
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Features:
- CSS-based bar animation (height transitions)
- Randomized heights for visual variety
- Primary color with opacity variations
- Responsive sizing
```

#### 2. Status Badge Component
**Used in**: Screen 3 (Live Connection), Screen 4 (Ready/Generating)

```tsx
// components/interview/StatusBadge.tsx
interface StatusBadgeProps {
  variant: 'live' | 'recording' | 'ready' | 'generating';
  label?: string;
}

// Variants:
- live: Green pulsing dot + "Live Connection"
- recording: Red bg + "RECORDING"
- ready: Green bg + "Ready"
- generating: Gray bg + pulsing dot + "Generating..."
```

#### 3. Trend Card Component
**Used in**: Screen 2 (Topic Selection)

**UPDATED for Real API**:
```tsx
// components/trends/TrendCard.tsx
import { TrendingTopic } from '@/lib/types/trending';

interface TrendCardProps {
  topic: TrendingTopic;
  isSelected: boolean;
  onToggle: (rank: number) => void;
  onExpand?: (rank: number) => void;  // Show full context + questions
}

// Display Mapping:
// - topic.rank → "Rank #1" badge (top-left)
// - topic.topic_title → Card heading
// - topic.why_this_matters → Description (line-clamp-3)
// - topic.global_context → Show in modal/accordion when expanded
// - topic.key_questions → Show as numbered list when expanded
// - topic.source_tweet_id → Optional "View Source" link

// Features:
- Two visual states (selected vs unselected)
- Rank badge (top-left): "Rank #1", "Rank #2", etc.
- Selection checkbox (top-right)
- Hover effects (-translate-y-1)
- "View Questions" button → Opens expansion (modal or accordion)
- Expanded view shows full global_context + 5 key questions
```

**Component Structure**:
```tsx
export function TrendCard({ topic, isSelected, onToggle, onExpand }: TrendCardProps) {
  return (
    <div className={cn(
      "relative flex flex-col rounded-xl p-6 transition-all hover:-translate-y-1",
      isSelected
        ? "border-2 border-primary shadow-glow"
        : "border border-slate-200 hover:border-primary/50"
    )}>
      {/* Rank Badge - Top Left */}
      <div className="absolute left-4 top-4">
        <span className={cn(
          "px-2 py-1 rounded-md text-xs font-bold",
          isSelected
            ? "bg-primary text-white"
            : "bg-slate-100 text-slate-600"
        )}>
          Rank #{topic.rank}
        </span>
      </div>

      {/* Selection Checkbox - Top Right */}
      <div className="absolute right-4 top-4">
        <button
          onClick={() => onToggle(topic.rank)}
          className={cn(
            "size-6 rounded-full flex items-center justify-center",
            isSelected
              ? "bg-primary text-white"
              : "border-2 border-slate-300 hover:border-primary"
          )}
        >
          {isSelected && <CheckIcon />}
        </button>
      </div>

      {/* Content */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-2">{topic.topic_title}</h3>
        <p className="text-sm text-slate-600 line-clamp-3 mb-4">
          {topic.why_this_matters}
        </p>

        {/* Expand Button */}
        <button
          onClick={() => onExpand?.(topic.rank)}
          className="text-sm text-primary font-medium hover:underline"
        >
          View {topic.key_questions.length} Key Questions →
        </button>
      </div>
    </div>
  );
}
```

#### 4. Asset Card Component
**Used in**: Screen 4 (Content Review)

```tsx
// components/content/AssetCard.tsx
interface AssetCardProps {
  platform: 'linkedin' | 'twitter' | 'newsletter' | 'custom';
  status: 'ready' | 'generating' | 'error';
  content: string;
  onRegenerate: () => void;
  onCopy: () => void;
  onEdit: (newContent: string) => void;
}

// Features:
- Platform-specific icons and colors
- Editable textarea (auto-resize)
- Action buttons (regenerate, copy, edit)
- Loading skeleton for generating state
- Twitter thread special layout
```

#### 5. Control Dock Component
**Used in**: Screen 3 (Voice Interview)

```tsx
// components/interview/ControlDock.tsx
interface ControlDockProps {
  isListening: boolean;
  onPause: () => void;
  onMicToggle: () => void;
  onEnd: () => void;
}

// Features:
- Floating bottom position (fixed)
- Backdrop blur effect
- Large center mic button with pulse animation
- Side buttons for pause/end
- Mobile-optimized spacing
```

---

## API Integration Patterns

### 1. Trending Topics Discovery (Screen 1 → Screen 2)

**TypeScript Interfaces**:
```typescript
// lib/types/trending.ts
export interface TrendingTopicsRequest {
  keywords: string;  // Comma-separated or single phrase
}

export interface TrendingTopic {
  rank: number;
  topic_title: string;
  global_context: string;
  why_this_matters: string;
  key_questions: string[];
  source_tweet_id: string;
}

export interface TrendingTopicsResponse {
  output: {
    topics: TrendingTopic[];
  };
}
```

**API Function**:
```typescript
// lib/api/trending.ts
const TRENDING_API_URL = 'https://n8n.vonex.dpdns.org/webhook/d5d9a6e1-56e9-4a86-b197-5fa56f3a56e1';

export async function discoverTrendingTopics(
  keywords: string
): Promise<TrendingTopic[]> {
  try {
    const response = await fetch(TRENDING_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: TrendingTopicsResponse = await response.json();
    return data.output.topics;
  } catch (error) {
    console.error('Failed to fetch trending topics:', error);
    throw new Error('Could not discover trending topics. Please try again.');
  }
}
```

**React Query Hook** (Recommended):
```typescript
// hooks/useTrendingTopics.ts
import { useQuery } from '@tanstack/react-query';
import { discoverTrendingTopics } from '@/lib/api/trending';

export function useTrendingTopics(keywords: string, enabled: boolean = false) {
  return useQuery({
    queryKey: ['trending-topics', keywords],
    queryFn: () => discoverTrendingTopics(keywords),
    enabled: enabled && keywords.length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });
}
```

**Usage in Component**:
```typescript
// app/(dashboard)/discover/trending/page.tsx
'use client';

import { useState } from 'react';
import { useTrendingTopics } from '@/hooks/useTrendingTopics';
import { TrendCard } from '@/components/trends/TrendCard';

export default function TrendingTopicsPage() {
  const [keywords, setKeywords] = useState('');
  const { data: topics, isLoading, error } = useTrendingTopics(keywords, true);

  if (isLoading) {
    return <LoadingState message="Analyzing conversations..." />;
  }

  if (error) {
    return <ErrorState message="Failed to discover topics" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {topics?.map((topic) => (
        <TrendCard
          key={topic.rank}
          topic={topic}
          isSelected={selectedTopics.includes(topic.rank)}
          onToggle={handleToggleTopic}
        />
      ))}
    </div>
  );
}
```

---

### 2. Standard API Call Pattern (Generic)
```typescript
// Use server actions or API routes
async function generateContent(sessionId: string) {
  try {
    const response = await fetch('/api/content/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) throw new Error('Generation failed');
    return await response.json();
  } catch (error) {
    // Show user-friendly error, log to monitoring service
    console.error(error);
    throw error;
  }
}
```

### Voice Streaming Pattern (WebSocket)
```typescript
// Use Deepgram SDK or native WebSocket
const socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL);

socket.onmessage = (event) => {
  const aiResponse = JSON.parse(event.data);
  // Optimistically update UI with AI's next question
  setMessages(prev => [...prev, aiResponse]);
};
```

### Credit-Based API Calls (Avatar Videos)
```typescript
// Always check credits before expensive operations
const { creditsRemaining } = await fetch('/api/user/credits').then(r => r.json());

if (creditsRemaining < AVATAR_VIDEO_COST) {
  // Show upgrade modal
  return;
}

// Proceed with generation
```

---

## Environment Variables

Create a `.env.local` file:

```bash
# Backend API
NEXT_PUBLIC_BACKEND_URL=https://voice-agent-1jao.onrender.com

# Trending Topics API (N8N)
NEXT_PUBLIC_TRENDING_API_URL=https://n8n.vonex.dpdns.org/webhook/d5d9a6e1-56e9-4a86-b197-5fa56f3a56e1

# Deepgram (Voice AI)
NEXT_PUBLIC_DEEPGRAM_API_KEY=your_deepgram_key_here

# Supabase (Optional - for user auth/storage)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Future: Video APIs (Phase 1.2)
HEYGEN_API_KEY=
SUBMAGIC_API_KEY=

# Future: Vector DB (AI Twin feature)
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
```

**Note**: The backend at `voice-agent-1jao.onrender.com` requires `OPENAI_API_KEY` on the server side for LinkedIn generation.

---

## State Management Strategy

### Local Component State
- Form inputs, UI toggles → `useState`

### Shared UI State
- Modals, toasts, sidebar → React Context

### Server State (API Data)
- **Recommended**: TanStack Query (React Query)
- Handles caching, refetching, optimistic updates
- Example:
```typescript
const { data: trends, isLoading } = useQuery({
  queryKey: ['trends', keywords],
  queryFn: () => fetchTrends(keywords),
  staleTime: 5 * 60 * 1000, // 5 min cache
});
```

### AI Twin Memory (Persistent)
- Store in Supabase Vector
- Load on app init, update after each interview
- Consider IndexedDB for offline access

---

## Performance Checklist

- [ ] Images: Use Next.js `<Image>` with `priority` for above-fold content
- [ ] Fonts: Self-host Google Fonts or use `next/font`
- [ ] Code splitting: Dynamic imports for heavy components (video editor)
- [ ] API routes: Implement rate limiting (prevent abuse)
- [ ] Voice streaming: Use Worker threads for audio processing
- [ ] Bundle size: Keep initial JS < 200KB (use `next bundle-analyzer`)

---

## Testing Strategy

### Critical Paths to Test
1. **Voice Recording Flow**: Mock Deepgram responses, ensure transcript updates
2. **Content Generation**: Stub API calls, verify UI shows correct platform previews
3. **Credit System**: Test blocking when credits exhausted
4. **Responsive Design**: Test on iPhone SE, iPad, Desktop (1440px)

### Tools
- **Jest + React Testing Library** for component tests
- **Playwright** for E2E flows (signup → interview → content generation)
- **Storybook** for isolated component development

---

## Deployment Considerations

### Vercel (Recommended for Next.js)
- Edge functions for API routes (low latency)
- Automatic preview deployments on PR
- Set environment variables in project settings

### Monitoring
- **Sentry** for error tracking
- **PostHog** or **Mixpanel** for product analytics
- **Axiom** for logs (especially voice stream errors)

---

## Security Considerations

1. **API Keys**: Never expose in client code (use server-side routes)
2. **Rate Limiting**: Implement on expensive endpoints (video generation)
3. **Audio Data**: Encrypt in transit (WSS for WebSocket), delete after processing
4. **User Content**: Respect "Do Not Train" preferences (if applicable)
5. **Credits**: Validate server-side before any paid API calls

---

## Common Pitfalls to Avoid

### 1. Ignoring Voice Latency
- **Wrong**: Wait for full transcript before showing UI feedback
- **Right**: Show waveform + "Listening..." immediately on mic access

### 2. Overcomplicating the Flow
- **Wrong**: 5-step wizard for trend discovery
- **Right**: Single screen with keywords → instant results

### 3. Forgetting Mobile Safari Quirks
- **Issue**: `getUserMedia()` requires HTTPS + user gesture
- **Solution**: Show explicit "Tap to Start Recording" button

### 4. Not Handling API Failures Gracefully
- **Wrong**: White screen of death on 500 error
- **Right**: "Oops, our AI had a hiccup. Retry?" with automatic retry logic

### 5. Ignoring Accessibility
- **Wrong**: Voice recorder only works with mouse clicks
- **Right**: Spacebar to record, Enter to submit (keyboard shortcuts)

---

## Vibecoding Tips

When working with AI code assistants:

1. **Reference this README**: Start prompts with "Per the DEVELOPMENT_README..."
2. **Be specific about components**: "Create the TrendCard component with the API structure from section 1"
3. **Include accessibility**: Always mention "ensure WCAG AA compliance"
4. **Mention the tech stack**: "Using Next.js App Router and Tailwind..."
5. **Request TypeScript types**: "Define the TrendDiscoveryResponse interface"
6. **Iterate on UX**: "Make the voice recorder feel more human by..."

---

## Version History

- **v1.0**: MVP - Trend Discovery + Voice Interview + Text Content
- **v1.1**: AI Twin Memory + Carousel Generator
- **v1.2**: Multi-Modal Video (Faceless + Avatar Reels) ← Current Target

---

## Questions to Resolve

Before coding, clarify with product/design:

- [ ] Do we have the PNG mockups for each major screen?
- [ ] What's the exact API contract for `/api/interview/respond`?
- [ ] Should the AI Twin visualization be 2D or 3D?
- [ ] Credit pricing: How many credits = 1 avatar video?
- [ ] Do we support dark mode from v1.0?

---

## Animation & Interaction Patterns

### Hover States
```css
/* Standard card hover */
hover:-translate-y-1 transition-all
hover:shadow-md

/* Button hover with scale */
hover:scale-105 active:scale-95 transition-transform

/* Icon hover */
hover:scale-110 transition-transform
```

### Loading States
```tsx
// Skeleton loader (Newsletter card example)
<div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4 animate-pulse" />

// Pulsing dot for live status
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
<span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />

// Waveform ambient glow
<div className="bg-primary/20 blur-[60px] animate-pulse-slow" />
```

### Focus States
```css
focus:ring-4 focus:ring-primary/10
focus:border-primary
focus:outline-none
```

### Dark Mode
- All screens support dark mode via `dark:` Tailwind prefix
- Background shifts: `bg-white dark:bg-slate-900`
- Text shifts: `text-slate-900 dark:text-white`
- Borders: `border-slate-200 dark:border-slate-800`
- Test both modes for every component

---

## Common UI Patterns from Designs

### Pattern 1: Ambient Background Glow
```tsx
// Used in Screen 1 and Screen 3
<div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                w-[800px] h-[800px] bg-primary/5 dark:bg-primary/10
                rounded-full blur-[100px] -z-10 pointer-events-none" />
```

### Pattern 2: Sticky Bottom Bar
```tsx
// Used in Screen 2 (Topic Selection)
<div className="fixed bottom-0 left-0 right-0 z-50
                border-t border-slate-200 bg-white/95 backdrop-blur-lg
                shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
  {/* Selection info + CTA */}
</div>
```

### Pattern 3: Icon + Badge Category Tag
```tsx
// Used in Screen 2 and Screen 5
<div className="flex items-center gap-3">
  <div className="size-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30
                  flex items-center justify-center text-indigo-600">
    <span className="material-symbols-outlined filled">work</span>
  </div>
  <span className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700
                   text-xs font-medium ring-1 ring-inset ring-indigo-700/10">
    #Productivity
  </span>
</div>
```

### Pattern 4: Transcript Message Styling
```tsx
// AI Message (Screen 3)
<div className="p-4 bg-white dark:bg-surface-dark rounded-xl shadow-sm
                border border-slate-100">
  <p className="text-sm font-semibold text-primary">
    AI Interviewer • <span className="font-normal">Current Question</span>
  </p>
  <p className="text-lg font-medium text-slate-900">{message}</p>
</div>

// User Message (Screen 3)
<div className="p-4 border-l-2 border-primary/20">
  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600
                   text-[10px] font-bold uppercase">Recording</span>
  <p className="text-lg text-slate-700">{message}</p>
</div>
```

### Pattern 5: Platform Icon Containers
```tsx
// LinkedIn (Screen 4)
<div className="size-8 rounded bg-[#0077b5] text-white
                flex items-center justify-center">
  <span className="font-bold text-lg">in</span>
</div>

// Twitter/X (Screen 4)
<div className="size-8 rounded bg-black text-white
                flex items-center justify-center">
  <span className="font-bold text-lg">X</span>
</div>
```

---

## Implementation Priority & Next Steps

### Phase 1: Foundation (Week 1)
1. ✅ Review PNG samples and DEVELOPMENT_README
2. Set up Next.js 14 project with App Router
3. Configure Tailwind with design system colors
4. Set up Supabase client
5. Build reusable UI components (Button, Card, Badge, Input)
6. Implement Navbar component (used across all screens)

### Phase 2: Core Screens (Week 2-3)
**Build in this order** (following user flow):

1. **Dashboard (Screen 5)** - Entry point
   - Sidebar navigation
   - Hero card with CTA
   - Sessions table with search
   - **Goal**: User can see their past sessions

2. **Topic Discovery (Screen 1)** - Start of creation flow
   - Keyword input textarea
   - Large primary CTA
   - API integration: `POST /api/trends/discover`
   - **Goal**: User can enter keywords and proceed

3. **Trending Topics (Screen 2)** - Topic selection
   - Category chips filter
   - Topic card grid with selection
   - Sticky bottom bar
   - API integration: `GET /api/trends/{id}`
   - **Goal**: User can select 1+ topics

4. **Live Interview (Screen 3)** - Voice recording
   - Waveform visualization
   - WebSocket integration for real-time transcription
   - Control dock (pause/mic/end)
   - Transcript stream
   - **Goal**: User can conduct voice interview
   - **Note**: This is highest technical risk - prototype early

5. **Content Review (Screen 4)** - Export assets
   - Split pane layout
   - Audio player with transcript
   - Asset cards (LinkedIn, Twitter, Newsletter)
   - Edit/copy/regenerate functionality
   - **Goal**: User can review and export content

### Phase 3: Polish & Multi-Modal (Week 4)
1. Add Carousel Generator (not in PNG samples, but in PRD)
2. Add Video Generator UI (faceless + avatar options)
3. Implement AI Twin visualization
4. Dark mode testing across all screens
5. Mobile responsive refinements
6. Accessibility audit

### Phase 4: Integration & Testing (Week 5+)
1. Full API integration with backend endpoints
2. Error handling and retry logic
3. Toast notifications for actions (copy, save, etc.)
4. Loading states for all async operations
5. E2E tests with Playwright
6. Performance optimization

---

## Vibecoding with This README

When working with AI assistants to build components, use this structure:

```
"Based on DEVELOPMENT_README.md, build the [Component Name] from Screen [X].

Requirements:
- Use the design system colors (--primary: #135bec)
- Follow the component structure from the 'Screen-by-Screen Guide'
- Include dark mode support
- Match the exact spacing and styling from the PNG sample
- Use Material Symbols Outlined for icons
- Make it mobile-responsive

Here's the specific section from the README:
[paste relevant section]
"
```

**Example Prompt**:
```
"Build the TrendCard component from Screen 2 (Trending Topic Selection).

Reference DEVELOPMENT_README.md > Screen 2 > Topic Cards section.

Requirements:
- Support selected and unselected states
- border-2 border-primary when selected, with shadow-glow
- Show category icon (colored circle) + hashtag badge
- Display engagement metrics (likes, comments, shares) with icons
- Show trending indicator (+X% this week) when applicable
- Hover effect: -translate-y-1 and shadow-md
- TypeScript with proper interface (TrendCardProps)
- Dark mode support
"
```

---

**Remember**: The goal is "Radical Simplicity" and a "Human-First" experience. Every design decision should make the creator feel empowered, not overwhelmed by AI.

The PNG samples show the exact visual target - reference them constantly during implementation to match spacing, colors, and interactions precisely.

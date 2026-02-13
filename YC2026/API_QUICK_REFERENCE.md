# API Quick Reference

Complete overview of all backend APIs and their usage in LadderFlow.

---

## 🌐 Base URLs

| Service | URL |
|---------|-----|
| **Trending Topics** | `https://n8n.vonex.dpdns.org/webhook/d5d9a6e1-56e9-4a86-b197-5fa56f3a56e1` |
| **Voice Agent Backend** | `https://voice-agent-1jao.onrender.com` |
| **Deepgram WebSocket** | `wss://api.deepgram.com/v1/listen` |

---

## 📋 Complete User Flow with APIs

### Step 1: Discover Trending Topics (Screen 1 → 2)

**User Action**: Enters keywords like "AI automation, productivity"

**API Call**:
```typescript
POST https://n8n.vonex.dpdns.org/webhook/d5d9a6e1-56e9-4a86-b197-5fa56f3a56e1

Request:
{
  "keywords": "AI automation"
}

Response:
{
  "output": {
    "topics": [
      {
        "rank": 1,
        "topic_title": "From Tool User To Debugging Strategist",
        "global_context": "As automation platforms...",
        "why_this_matters": "Most learning content...",
        "key_questions": ["How do you train...", "..."],
        "source_tweet_id": "2005336131026755874"
      }
      // ... 4 more topics (ranks 2-5)
    ]
  }
}
```

**What Happens**:
- Display 5 ranked topic cards
- User selects 1+ topics
- Click "Create Interview" → Go to Screen 3

---

### Step 2: Generate Agent Configuration (Screen 2 → 3)

**User Action**: Clicks "Create Interview" with selected topic

**API Call**:
```typescript
POST https://voice-agent-1jao.onrender.com/agent-config

Request:
{
  "topic": "From Tool User To Debugging Strategist",
  "userName": "Alex Chen",
  "topic_title": "From Tool User To Debugging Strategist",
  "global_context": "As automation platforms become embedded...",
  "why_this_matters": "Most learning content teaches where to click...",
  "key_questions": [
    "How do you train yourself to think like a debugger?",
    "What debugging rituals separate pros from casual builders?",
    "How can companies design observable automation?",
    "What are common debugging anti-patterns?",
    "How does AI change debugging approaches?"
  ]
}

Response:
{
  "systemPrompt": "You are an expert AI interviewer...",
  "topicTitle": "From Tool User To Debugging Strategist",
  "userName": "Alex Chen",
  "deepgramConfig": {
    "type": "Settings",
    "audio": { /* audio config */ },
    "agent": {
      "language": "en",
      "greeting": "Hi Alex! Welcome to our conversation about...",
      "listen": { /* Deepgram STT config */ },
      "think": { /* OpenAI GPT-4o-mini config with systemPrompt */ },
      "speak": { /* Deepgram TTS config */ }
    }
  }
}
```

**What Happens**:
- Store `deepgramConfig` for WebSocket initialization
- Navigate to Interview screen
- Show greeting message

---

### Step 3: Conduct Voice Interview (Screen 3)

**User Action**: Speaks into microphone, converses with AI

**WebSocket Flow**:
```typescript
// 1. Connect to Deepgram WebSocket
const ws = new WebSocket(`wss://api.deepgram.com/v1/listen?token=${DEEPGRAM_API_KEY}`);

// 2. Send initial configuration (from /agent-config)
ws.send(JSON.stringify(deepgramConfig));

// 3. Stream audio chunks
navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
  const mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = (event) => {
    ws.send(event.data);  // Send audio to Deepgram
  };
});

// 4. Receive conversation events
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'ConversationText') {
    // Store message for transcript
    messages.push({
      role: data.role,       // 'user' or 'assistant'
      content: data.content  // Spoken text
    });

    // Update UI
    updateTranscript(data);
  }
};
```

**What Happens**:
- Real-time speech-to-text for user
- AI generates questions/responses using GPT-4o-mini
- AI speaks responses using Deepgram TTS (Aura-2)
- Collect all messages in array
- Track interview duration

**User Action**: Clicks "End Interview"

---

### Step 4: Format Transcript (Screen 3 → 4)

**User Action**: Interview ends, processing begins

**API Call**:
```typescript
POST https://voice-agent-1jao.onrender.com/transcript

Request:
{
  "topic": "From Tool User To Debugging Strategist",
  "userName": "Alex Chen",
  "messages": [
    { "role": "assistant", "content": "Hi Alex! Welcome to our conversation..." },
    { "role": "user", "content": "Thanks! I've been working with automation..." },
    { "role": "assistant", "content": "Interesting. Tell me more about..." },
    // ... all collected messages
  ],
  "duration": 312  // seconds (5 min 12 sec)
}

Response:
{
  "success": true,
  "topic": "From Tool User To Debugging Strategist",
  "userName": "Alex Chen",
  "duration": "5 min 12 sec",
  "transcript": "Alex Chen: Thanks! I've been working with automation...\n\nAI Host: Interesting. Tell me more about...",
  "content": {
    "linkedin": "",
    "twitter": ""
  }
}
```

**What Happens**:
- Formatted transcript with speaker labels
- Display in left pane of Screen 4
- Show audio player (if audio was recorded)
- Auto-trigger LinkedIn generation

---

### Step 5: Generate LinkedIn Post (Screen 4)

**User Action**: System automatically generates LinkedIn post (or user clicks "Regenerate")

**API Call**:
```typescript
POST https://voice-agent-1jao.onrender.com/generate-linkedin

Request:
{
  "topic": "From Tool User To Debugging Strategist",
  "userName": "Alex Chen",
  "transcript": "Alex Chen: Thanks! I've been working with automation..."
}

Response:
{
  "linkedin": "3 years debugging automation workflows.\n\nThe mistake everyone makes isn't the tool.\n\nIt's assuming n8n or Zapier will 'just work' at scale.\n\nHere's what I learned the hard way:\n\n[200-350 word viral LinkedIn post]\n\n#Automation #NoCode #Debugging"
}
```

**What Happens**:
- Display LinkedIn post in right pane
- Show editable textarea
- "Copy" button for quick clipboard action
- "Regenerate" button to try again

---

## 🔗 API Dependency Chain

```
User Input
    ↓
[Trending Topics API]
    ↓
Selected Topic Data
    ↓
[Agent Config API]
    ↓
Deepgram WebSocket Config
    ↓
[Deepgram Voice Streaming]
    ↓
Conversation Messages Array
    ↓
[Transcript API]
    ↓
Formatted Transcript
    ↓
[LinkedIn Generation API]
    ↓
LinkedIn Post Content
```

---

## 📊 API Response Times

| API | Expected Time | Timeout |
|-----|--------------|---------|
| Trending Topics | 5-15 seconds | 30s |
| Agent Config | 1-3 seconds | 10s |
| Deepgram WebSocket | <200ms latency | - |
| Transcript | <1 second | 5s |
| LinkedIn Generation | 3-8 seconds | 30s |

---

## 🔐 Environment Variables Required

```bash
# For Trending Topics
NEXT_PUBLIC_TRENDING_API_URL=https://n8n.vonex.dpdns.org/webhook/d5d9a6e1-56e9-4a86-b197-5fa56f3a56e1

# For Voice Agent Backend
NEXT_PUBLIC_BACKEND_URL=https://voice-agent-1jao.onrender.com

# For Deepgram WebSocket
NEXT_PUBLIC_DEEPGRAM_API_KEY=your_deepgram_api_key

# Backend server-side (on render.com)
OPENAI_API_KEY=your_openai_key  # Used by backend for GPT-4o
```

---

## 🚨 Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 500 on `/agent-config` | Missing topic data | Ensure all topic fields are passed |
| Empty `messages` array | WebSocket didn't connect | Check Deepgram API key |
| LinkedIn generation timeout | GPT-4o API slow | Retry with exponential backoff |
| CORS error | Direct browser call | Use Next.js API route as proxy |

### Retry Logic

```typescript
// For long-running operations (LinkedIn generation)
const MAX_RETRIES = 2;
const RETRY_DELAY = 2000; // 2 seconds

async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
}
```

---

## 📝 TypeScript Interfaces Summary

```typescript
// Trending Topics
interface TrendingTopic {
  rank: number;
  topic_title: string;
  global_context: string;
  why_this_matters: string;
  key_questions: string[];
  source_tweet_id: string;
}

// Agent Config
interface AgentConfigRequest {
  topic: string;
  userName?: string;
  topic_title?: string;
  global_context?: string;
  why_this_matters?: string;
  key_questions?: string[];
}

// Messages
interface TranscriptMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Transcript
interface TranscriptRequest {
  topic?: string;
  userName?: string;
  messages: TranscriptMessage[];
  duration?: number;
}

// LinkedIn
interface LinkedInGenerationRequest {
  topic: string;
  userName?: string;
  transcript: string;
}
```

---

## 🎯 Implementation Checklist

- [ ] Set up environment variables
- [ ] Create TypeScript types in `lib/types/`
- [ ] Implement API clients in `lib/api/`
- [ ] Create React Query hooks in `hooks/`
- [ ] Build UI components for each screen
- [ ] Test complete flow: Keywords → Interview → Content
- [ ] Add error handling and loading states
- [ ] Implement retry logic for flaky endpoints

---

**See [API_INTEGRATION.md](./API_INTEGRATION.md) for complete code examples and detailed documentation.**

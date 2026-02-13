# LadderFlow

**Voice-First Content Creation Platform** — Transform voice conversations into high-performing multi-modal content through AI-powered trend discovery and voice interviews.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![React Query](https://img.shields.io/badge/React_Query-5.0-FF4154?logo=react-query)](https://tanstack.com/query)

---

## 🎯 What is LadderFlow?

LadderFlow is a **"Human-First" content engine** that transforms raw verbal insights into multi-modal content (LinkedIn posts, Twitter threads, newsletters, carousels, and video reels) through voice-first interaction.

### The Problem
Content creators spend hours researching trends, writing posts, and repurposing content across platforms. The process is time-consuming and often results in content that doesn't resonate.

### The Solution
LadderFlow automates the entire content creation workflow:
1. **Discover** trending topics in your niche using AI
2. **Interview** you about the topic through a natural voice conversation
3. **Generate** platform-optimized content from your authentic voice
4. **Export** ready-to-publish content for LinkedIn, Twitter, newsletters, and more

---

## ✨ Key Features

### 🔍 AI-Powered Trend Discovery
- Enter 3-5 keywords related to your niche
- Get 5 ranked trending topics with context, relevance, and key questions
- Topics are sourced from real-time social conversations

### 🎙️ Voice-First AI Interview
- Real-time voice conversation with an AI interviewer
- Powered by Deepgram's Voice Agent API
- Natural, conversational flow guided by research-backed questions
- Live transcription as you speak

### ✍️ Multi-Modal Content Generation
- **LinkedIn Posts**: Optimized for viral engagement (200-350 words, storytelling format)
- **Twitter Threads**: Punchy, thread-optimized content
- **Newsletters**: Long-form email content
- **Coming Soon**: Carousels, Reels, Avatar Videos

### 📊 Content Creator Dashboard
- Track all your interview sessions
- View generated content history
- Quick access to continue or create new content

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Deepgram API key (for voice features)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ladder-voice.git
cd ladder-voice

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Edit .env.local with your API keys
# Required: DEEPGRAM_API_KEY for voice interviews

# Run development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables

```env
# API Endpoints (Server-Side Only)
TRENDING_API_URL=https://n8n.vonex.dpdns.org/webhook/...
BACKEND_URL=https://voice-agent-1jao.onrender.com

# Deepgram Voice AI (Required for interviews)
DEEPGRAM_API_KEY=your_deepgram_api_key_here

# Optional: Feature flags
USE_MOCK_DATA=false
```

---

## 📱 Application Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Dashboard  │ ──▶ │   Topic     │ ──▶ │   Topic     │ ──▶ │    Voice    │ ──▶ │   Content   │
│  /dashboard │     │   Input     │     │  Selection  │     │  Interview  │     │   Review    │
│             │     │  /discover  │     │  /trending  │     │ /interview  │     │   /review   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │                   │                   │
      │                   │                   │                   │                   │
      ▼                   ▼                   ▼                   ▼                   ▼
 View history        Enter 3-5          Select from         Real-time          Review & edit
 Start new          keywords           5 AI-curated         voice chat         generated
 session                                topics              with AI host        content
```

### Screen Details

| Screen | Route | Description |
|--------|-------|-------------|
| **Dashboard** | `/dashboard` | Home screen with session history and quick actions |
| **Topic Discovery** | `/discover` | Enter keywords to discover trending topics |
| **Topic Selection** | `/discover/trending` | Choose from 5 AI-ranked trending topics |
| **Voice Interview** | `/interview/[id]` | Real-time voice conversation with AI interviewer |
| **Content Review** | `/review/[id]` | Review, edit, and export generated content |

---

## 🏗️ Project Structure

```
ladder-voice/
├── app/                              # Next.js App Router
│   ├── (dashboard)/                  # Dashboard layout group
│   │   ├── dashboard/page.tsx        # Main dashboard
│   │   ├── discover/page.tsx         # Topic input
│   │   │   └── trending/page.tsx     # Topic selection
│   │   ├── interview/[id]/page.tsx   # Voice interview
│   │   └── review/[id]/page.tsx      # Content review
│   ├── api/                          # API Routes (Server-side)
│   │   ├── trending/route.ts         # Trending topics proxy
│   │   ├── agent/                    # Voice agent endpoints
│   │   ├── content/                  # Content generation
│   │   └── deepgram/token/route.ts   # Deepgram auth
│   ├── layout.tsx                    # Root layout
│   ├── providers.tsx                 # React Query provider
│   └── globals.css                   # Global styles & design system
│
├── components/
│   ├── ui/                           # Base components (Button, Card, Input, etc.)
│   ├── layout/                       # Navbar, Sidebar, PageHeader
│   ├── shared/                       # LoadingState, ErrorState, StatusBadge
│   ├── trends/                       # TrendCard, TrendGrid, KeywordInput
│   ├── interview/                    # Waveform, TranscriptPanel, ControlDock
│   ├── content/                      # AssetCard, AudioPlayer, TranscriptViewer
│   └── dashboard/                    # HeroCard, SessionsTable
│
├── hooks/                            # Custom React hooks
│   ├── useDeepgramAgent.ts           # Voice agent WebSocket connection
│   ├── useTrendingTopics.ts          # Trending topics fetching
│   ├── useAgentConfig.ts             # Agent configuration
│   └── useLinkedInGenerator.ts       # Content generation
│
├── lib/
│   ├── api/                          # API client functions
│   ├── types/                        # TypeScript interfaces
│   └── utils.ts                      # Helper functions
│
└── png-samples/                      # Visual design references
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS 4** | Utility-first styling |
| **React Query** | Server state management |
| **Zustand** | Client state management |

### Backend APIs
| Service | Purpose |
|---------|---------|
| **N8N Webhook** | Trending topic discovery |
| **FastAPI Backend** | Agent config, transcript formatting, content generation |
| **Deepgram Voice Agent** | Real-time voice conversations |
| **GPT-4o** | Content generation (via backend) |

### Key Integrations
- **Deepgram Nova-3**: Speech-to-text
- **Deepgram Aura-2**: Text-to-speech
- **OpenAI GPT-4o-mini**: AI interviewer intelligence

---

## 🔌 API Architecture

### Server-Side API Routes
All external API calls are proxied through Next.js API routes to keep API keys secure:

```
Client                    Next.js API Routes              External APIs
  │                              │                              │
  │  POST /api/trending          │                              │
  │ ────────────────────────────▶│  POST n8n.vonex.dpdns.org   │
  │                              │ ────────────────────────────▶│
  │                              │◀────────────────────────────│
  │◀────────────────────────────│                              │
  │                              │                              │
  │  POST /api/agent/config      │                              │
  │ ────────────────────────────▶│  POST voice-agent.../agent  │
  │                              │ ────────────────────────────▶│
  │                              │◀────────────────────────────│
  │◀────────────────────────────│                              │
  │                              │                              │
  │  GET /api/deepgram/token     │                              │
  │ ────────────────────────────▶│  (Returns API key)          │
  │◀────────────────────────────│                              │
  │                              │                              │
  │  WebSocket to Deepgram       │                              │
  │ ─────────────────────────────────────────────────────────▶│
  │◀─────────────────────────────────────────────────────────│
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/trending` | POST | Discover trending topics from keywords |
| `/api/agent/config` | POST | Generate Deepgram voice agent config |
| `/api/agent/health` | GET | Check backend health |
| `/api/content/linkedin` | POST | Generate LinkedIn post from transcript |
| `/api/deepgram/token` | GET | Get Deepgram API key for client |

---

## 🎨 Design System

### Colors
```css
--primary: #135bec        /* Brand blue */
--background-light: #f6f6f8
--background-dark: #101622
--surface-dark: #1a2332
```

### Typography
- **Font**: Inter (300-900 weights)
- **Icons**: Material Symbols Outlined

### Design Principles
1. **Mobile-First**: Designed for 375px and up
2. **Dark Mode**: Full support with `dark:` classes
3. **<200ms Latency**: Voice interactions feel instant
4. **Accessibility**: WCAG 2.1 AA compliant

---

## 📂 Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](./QUICKSTART.md) | Step-by-step setup guide |
| [DEVELOPMENT_README.md](./DEVELOPMENT_README.md) | Complete development reference |
| [API_INTEGRATION.md](./API_INTEGRATION.md) | Full API documentation with code |
| [API_QUICK_REFERENCE.md](./API_QUICK_REFERENCE.md) | API flow overview |
| [COMPONENT_PATTERNS.md](./COMPONENT_PATTERNS.md) | Copy-paste UI patterns |

---

## 🧪 Development

### Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Build
npm run build        # Production build
npm run start        # Start production server

# Quality
npm run lint         # Run ESLint
```

### Testing the Voice Interview

1. Get a Deepgram API key from [console.deepgram.com](https://console.deepgram.com/)
2. Add it to `.env.local` as `DEEPGRAM_API_KEY`
3. Navigate to `/discover` → enter keywords → select a topic → start interview
4. Allow microphone access when prompted
5. Have a conversation with the AI interviewer
6. End the interview to see generated content

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Environment Variables for Production

```env
TRENDING_API_URL=https://n8n.vonex.dpdns.org/webhook/...
BACKEND_URL=https://voice-agent-1jao.onrender.com
DEEPGRAM_API_KEY=your_production_key
```

> **Important**: Never use `NEXT_PUBLIC_` prefix for API keys. All sensitive keys are accessed server-side only.

---

## 🗺️ Roadmap

### ✅ Completed
- [x] Trending topic discovery
- [x] Topic selection UI
- [x] Voice interview with Deepgram
- [x] LinkedIn content generation
- [x] Dark mode support
- [x] Mobile responsive design

### 🚧 In Progress
- [ ] Twitter thread generation
- [ ] Newsletter generation
- [ ] Audio playback in review

### 📋 Planned
- [ ] Carousel generator
- [ ] Video reels (faceless)
- [ ] Avatar video generation
- [ ] AI Twin memory system
- [ ] User authentication
- [ ] Session persistence

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary.

---

## 🙏 Acknowledgments

- [Deepgram](https://deepgram.com/) - Voice AI platform
- [OpenAI](https://openai.com/) - GPT-4o for content generation
- [Vercel](https://vercel.com/) - Hosting and deployment
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

---

<p align="center">
  Built with ❤️ for content creators who want to scale their authentic voice
</p>

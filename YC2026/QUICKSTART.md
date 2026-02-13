# LadderFlow - Quick Start Guide

Get up and running with the LadderFlow frontend in under 30 minutes.

## Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager
- Git
- Code editor (VS Code recommended)

---

## Step 1: Project Setup

This appears to be a Next.js project. Verify the setup:

```bash
# Check current directory
pwd  # Should be: .../frontend-ladder-voice/ladder-voice

# Check if Next.js is already initialized
ls -la

# If package.json exists, install dependencies
npm install
# or
pnpm install
```

If starting fresh:
```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
```

---

## Step 2: Install Additional Dependencies

```bash
# UI Components (if using Shadcn)
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-slot
npm install class-variance-authority clsx tailwind-merge lucide-react

# State Management
npm install zustand  # or use React Context

# API & Data Fetching
npm install @tanstack/react-query axios

# Supabase
npm install @supabase/supabase-js

# Deepgram (Voice)
npm install @deepgram/sdk

# Audio Visualization (optional, can use CSS)
npm install wavesurfer.js  # if needed for advanced waveforms

# Development
npm install -D @types/node @types/react @types/react-dom
```

---

## Step 3: Configure Tailwind

Update `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#135bec",
        "background-light": "#f6f6f8",
        "background-dark": "#101622",
        "surface-light": "#ffffff",
        "surface-dark": "#1a2230",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
      },
      boxShadow: {
        glow: "0 0 20px rgba(19, 91, 236, 0.15)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};

export default config;
```

---

## Step 4: Add Google Fonts & Material Symbols

Update `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "LadderFlow - Voice to Content Engine",
  description: "Transform voice conversations into multi-modal content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        {/* Material Symbols */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-display antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

Update `globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-background-light dark:bg-background-dark;
    @apply text-slate-900 dark:text-white;
  }

  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  .material-symbols-outlined.filled {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
}

@layer utilities {
  /* Custom scrollbar */
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-slate-300 dark:bg-slate-600 rounded;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    @apply bg-slate-400 dark:bg-slate-500;
  }
}
```

---

## Step 5: Set Up Environment Variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Deepgram
NEXT_PUBLIC_DEEPGRAM_API_KEY=your_deepgram_key

# Backend API (if separate)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

# Video APIs (for Phase 1.2)
HEYGEN_API_KEY=your_heygen_key
SUBMAGIC_API_KEY=your_submagic_key

# Vector DB
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=your_pinecone_env
```

---

## Step 6: Create Folder Structure

```bash
mkdir -p app/{api,\(auth\),\(dashboard\)}
mkdir -p app/\(dashboard\)/{discover,interview,review,brain}
mkdir -p components/{ui,layout,trends,interview,content,dashboard,shared}
mkdir -p lib/{supabase,deepgram}
```

---

## Step 7: Create Utility Functions

Create `lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

---

## Step 8: Build Your First Component

Let's build the Navbar from the designs.

Create `components/layout/Navbar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="w-full bg-white dark:bg-[#1a2230] border-b border-[#f0f2f4] dark:border-[#2a3441] sticky top-0 z-50">
      <div className="px-4 md:px-10 py-3 flex items-center justify-between mx-auto max-w-7xl">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 text-[#111318] dark:text-white">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl">graphic_eq</span>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-tight">
            LadderFlow
          </h2>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 justify-center gap-8">
          <Link
            href="/dashboard"
            className={cn(
              "text-sm font-medium transition-colors",
              isActive("/dashboard")
                ? "text-primary font-bold"
                : "text-[#616f89] dark:text-[#9ca3af] hover:text-primary"
            )}
          >
            Dashboard
          </Link>
          <Link
            href="/discover"
            className={cn(
              "text-sm font-medium transition-colors",
              isActive("/discover")
                ? "text-primary font-bold"
                : "text-[#616f89] dark:text-[#9ca3af] hover:text-primary"
            )}
          >
            Content
          </Link>
          <Link
            href="/settings"
            className={cn(
              "text-sm font-medium transition-colors",
              isActive("/settings")
                ? "text-primary font-bold"
                : "text-[#616f89] dark:text-[#9ca3af] hover:text-primary"
            )}
          >
            Settings
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button className="flex items-center justify-center size-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-[#616f89] dark:text-[#9ca3af] transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="size-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white dark:border-[#2a3441]" />
        </div>
      </div>
    </header>
  );
}
```

Use it in your layout:

```tsx
// app/(dashboard)/layout.tsx
import { Navbar } from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
```

---

## Step 9: Create Your First Page

Create `app/(dashboard)/dashboard/page.tsx`:

```tsx
export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Welcome back. You have 3 pending drafts.
        </p>
      </div>

      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-50 dark:bg-[#1e2736] border border-slate-100 dark:border-slate-800 p-8">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <span className="material-symbols-outlined text-[16px]">mic</span>
            <span>Voice AI 2.0</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
            Create New Content Session
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-base max-w-md mb-6">
            Turn your voice conversations into high-performing social media content, blog posts, and newsletters instantly.
          </p>
          <button className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[20px]">add</span>
            New Session
          </button>
        </div>

        {/* Ambient background */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      </div>
    </div>
  );
}
```

---

## Step 10: Run Development Server

```bash
npm run dev
# or
pnpm dev
```

Visit `http://localhost:3000/dashboard` to see your first screen!

---

## Next Steps

Now that your foundation is set up:

1. **Build screens in order** (following DEVELOPMENT_README.md Phase 2):
   - ✅ Dashboard (you just built it!)
   - → Topic Discovery Input (Screen 1)
   - → Trending Topics (Screen 2)
   - → Live Interview (Screen 3)
   - → Content Review (Screen 4)

2. **Reference the documentation**:
   - `DEVELOPMENT_README.md` - Full feature specs
   - `COMPONENT_PATTERNS.md` - Copy-paste component code
   - `png-samples/` - Visual reference for each screen

3. **Set up API routes**:
   ```bash
   # Create API structure
   mkdir -p app/api/{trends,interview,content,brain}
   ```

4. **Implement Supabase** (if needed):
   ```typescript
   // lib/supabase/client.ts
   import { createClient } from '@supabase/supabase-js';

   export const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   );
   ```

5. **Add dark mode toggle**:
   ```bash
   npm install next-themes
   ```

---

## Development Workflow

### When Building a New Component:

1. **Reference the PNG sample** for that screen
2. **Read the corresponding section** in DEVELOPMENT_README.md
3. **Copy base patterns** from COMPONENT_PATTERNS.md
4. **Customize** for your specific needs
5. **Test** in both light and dark mode
6. **Ensure mobile responsiveness**

### Using AI Assistance (Vibecoding):

```
"Build the TrendCard component for Screen 2.

Reference:
- DEVELOPMENT_README.md > Screen 2 > Topic Cards
- COMPONENT_PATTERNS.md > Card States > Selected Topic Card

Requirements:
- TypeScript with TrendCardProps interface
- Support selected/unselected states
- Dark mode compatible
- Engagement metrics with icons
- Hover animations
"
```

---

## Troubleshooting

### Material Symbols not showing?
Make sure the font link is in your `<head>` tag.

### Tailwind classes not working?
Run `npm run dev` to restart the development server.

### Dark mode not working?
Ensure your `<html>` tag has `className="light"` or `className="dark"`.

### TypeScript errors?
Install missing types: `npm install -D @types/node`

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Material Symbols](https://fonts.google.com/icons)
- [Supabase Docs](https://supabase.com/docs)
- [Deepgram Docs](https://developers.deepgram.com/)

---

**You're ready to build!** Start with the Dashboard, then move to Topic Discovery. Reference the PNG samples constantly to match the design precisely.

Happy coding! 🚀

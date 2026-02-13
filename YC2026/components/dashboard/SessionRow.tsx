'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn, formatDurationLong, formatRelativeTime } from '@/lib/utils';
import { IconWrapper } from '@/components/shared/IconWrapper';
import type { Session, SessionCategory } from '@/lib/types/session';

interface SessionRowProps {
  session: Session;
}

const categoryConfig: Record<SessionCategory, { icon: string; color: 'indigo' | 'teal' | 'green' | 'orange' | 'pink' }> = {
  productivity: { icon: 'work', color: 'indigo' },
  technology: { icon: 'smart_toy', color: 'teal' },
  business: { icon: 'trending_up', color: 'green' },
  marketing: { icon: 'campaign', color: 'orange' },
  general: { icon: 'lightbulb', color: 'pink' },
};

const tagColors: Record<string, string> = {
  'AI': 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'Productivity': 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  'Business': 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Marketing': 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Tech': 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export function SessionRow({ session }: SessionRowProps) {
  const config = categoryConfig[session.category];
  const [relativeTime, setRelativeTime] = useState<string>('');

  // Calculate relative time on client-side only to avoid hydration mismatch
  useEffect(() => {
    setRelativeTime(formatRelativeTime(session.createdAt));
  }, [session.createdAt]);

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl hover:bg-[#F7F7F8] dark:hover:bg-slate-800/50 transition-all cursor-pointer">
      {/* Category Icon */}
      <IconWrapper icon={config.icon} color={config.color} filled />

      {/* Session Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
          {session.title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {relativeTime || 'Loading...'} • {formatDurationLong(session.duration)}
        </p>
      </div>

      {/* Tags */}
      <div className="hidden md:flex items-center gap-2">
        {session.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className={cn(
              'px-2 py-0.5 text-[10px] font-semibold rounded-md',
              tagColors[tag] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            )}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Actions (visible on hover) */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link href={`/review/${session.id}`}>
          <button className="px-3 py-1.5 text-xs font-semibold text-[#135bec] bg-[#135bec]/10 hover:bg-[#135bec]/20 rounded-lg transition-colors">
            View Content
          </button>
        </Link>
        <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          <span className="material-symbols-outlined text-[18px]">content_copy</span>
        </button>
      </div>
    </div>
  );
}

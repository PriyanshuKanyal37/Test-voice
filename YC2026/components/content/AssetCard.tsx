'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import type { ContentPlatform, ContentStatus } from '@/lib/types/content';

interface AssetCardProps {
  platform: ContentPlatform;
  status: ContentStatus;
  content: string;
  onRegenerate?: () => void;
  onCopy?: () => void;
  onEdit?: (newContent: string) => void;
}

const platformConfig: Record<ContentPlatform, { name: string; icon: React.ReactNode; color: string }> = {
  linkedin: {
    name: 'LinkedIn Post',
    icon: <span className="font-bold text-lg">in</span>,
    color: 'bg-[#0077b5]',
  },
  twitter: {
    name: 'Twitter Thread',
    icon: <span className="font-bold text-lg">X</span>,
    color: 'bg-black',
  },
  newsletter: {
    name: 'Newsletter Blurb',
    icon: <span className="material-symbols-outlined text-lg">mail</span>,
    color: 'bg-orange-500',
  },
  carousel: {
    name: 'Carousel',
    icon: <span className="material-symbols-outlined text-lg">view_carousel</span>,
    color: 'bg-gradient-to-br from-purple-500 to-pink-500',
  },
  video: {
    name: 'Video Reel',
    icon: <span className="material-symbols-outlined text-lg">movie</span>,
    color: 'bg-red-500',
  },
};

export function AssetCard({ 
  platform, 
  status, 
  content, 
  onRegenerate, 
  onCopy, 
  onEdit 
}: AssetCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [copied, setCopied] = useState(false);

  const config = platformConfig[platform];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  const handleSave = () => {
    onEdit?.(editedContent);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {/* Platform Icon */}
          <div className={cn('size-8 rounded flex items-center justify-center text-white', config.color)}>
            {config.icon}
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">
            {config.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <StatusBadge variant={status === 'ready' ? 'ready' : 'generating'} />

          {/* Actions */}
          {status === 'ready' && (
            <div className="flex items-center gap-1">
              <button
                onClick={onRegenerate}
                className="p-2 text-slate-400 hover:text-[#135bec] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Regenerate"
              >
                <span className="material-symbols-outlined text-[20px]">autorenew</span>
              </button>
              <button
                onClick={handleCopy}
                className="p-2 text-slate-400 hover:text-[#135bec] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title={copied ? 'Copied!' : 'Copy'}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {copied ? 'check' : 'content_copy'}
                </span>
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={cn(
                  'p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors',
                  isEditing ? 'text-[#135bec]' : 'text-slate-400 hover:text-[#135bec]'
                )}
                title="Edit"
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {status === 'generating' ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : isEditing ? (
          <div>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full min-h-[200px] p-3 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-transparent resize-none focus:ring-2 focus:ring-[#135bec]/20 focus:border-[#135bec] focus:outline-none"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => {
                  setEditedContent(content);
                  setIsEditing(false);
                }}
                className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 text-sm bg-[#135bec] text-white rounded-lg hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {content}
          </p>
        )}
      </div>
    </div>
  );
}

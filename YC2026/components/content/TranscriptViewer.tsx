'use client';

import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/utils';

interface TranscriptSegment {
  speaker: string;
  content: string;
  startTime: number;
  endTime: number;
}

interface TranscriptViewerProps {
  segments: TranscriptSegment[];
  activeSegment?: number;
  onSegmentClick?: (time: number) => void;
}

export function TranscriptViewer({ segments, activeSegment, onSegmentClick }: TranscriptViewerProps) {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
      {segments.map((segment, index) => (
        <div
          key={index}
          onClick={() => onSegmentClick?.(segment.startTime)}
          className={cn(
            'p-3 rounded-lg cursor-pointer transition-all',
            activeSegment === index
              ? 'bg-[#135bec]/5 border-l-4 border-[#135bec]'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              'text-xs font-semibold',
              segment.speaker === 'AI Host'
                ? 'text-[#135bec]'
                : 'text-slate-600 dark:text-slate-400'
            )}>
              {segment.speaker}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {formatDuration(segment.startTime)}
            </span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {segment.content}
          </p>
        </div>
      ))}
    </div>
  );
}

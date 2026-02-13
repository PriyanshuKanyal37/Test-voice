'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface KeywordInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function KeywordInput({ 
  value, 
  onChange, 
  onSubmit, 
  disabled,
  placeholder = "e.g. AI automation, No-code, Remote work culture..." 
}: KeywordInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="bg-white dark:bg-[#1a2230] rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 p-2 md:p-3 border border-gray-100 dark:border-gray-800">
      <div className="relative w-full">
        <label className="sr-only" htmlFor="topic-input">
          Topic Keywords
        </label>

        {/* Icon */}
        <div className="absolute top-5 left-5 text-[#135bec] pointer-events-none">
          <span className="material-symbols-outlined">edit_note</span>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          id="topic-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            'w-full min-h-[200px] bg-transparent border-0 rounded-xl',
            'p-5 pl-14 text-lg md:text-xl text-[#111318] dark:text-white',
            'placeholder:text-[#94a3b8] dark:placeholder:text-[#64748b]',
            'focus:ring-0 focus:outline-none resize-none leading-relaxed',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          placeholder={placeholder}
        />

        {/* Bottom Helper */}
        <div className="px-5 pb-3 flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-3 mt-2">
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Keywords
          </span>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-500 dark:text-gray-400 font-medium">
            Comma separated
          </span>
        </div>
      </div>
    </div>
  );
}

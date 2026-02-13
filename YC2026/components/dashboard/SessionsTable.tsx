'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { SessionRow } from './SessionRow';
import type { Session } from '@/lib/types/session';

interface SessionsTableProps {
  sessions: Session[];
}

export function SessionsTable({ sessions }: SessionsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Recent Sessions
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {sessions.length} sessions total
          </p>
        </div>

        {/* Search */}
        <div className="w-full md:w-72">
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<span className="material-symbols-outlined text-[20px]">search</span>}
          />
        </div>
      </div>

      {/* Table Header (Desktop) */}
      <div className="hidden md:flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        <div className="flex-1 pl-14">Session Title</div>
        <div className="w-40">Tags</div>
        <div className="w-32">Actions</div>
      </div>

      {/* Session Rows */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <SessionRow key={session.id} session={session} />
          ))
        ) : (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">
              search_off
            </span>
            <p className="text-slate-500 dark:text-slate-400">
              No sessions found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

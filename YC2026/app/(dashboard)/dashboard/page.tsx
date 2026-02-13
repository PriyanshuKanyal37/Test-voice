'use client';

import { useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { HeroCard } from '@/components/dashboard/HeroCard';
import { SessionsTable } from '@/components/dashboard/SessionsTable';
import type { Session } from '@/lib/types/session';

// Helper to create mock sessions with stable dates
function createMockSessions(): Session[] {
  const now = Date.now();
  return [
    {
      id: '1',
      title: 'The Future of AI in Content Creation',
      status: 'completed',
      category: 'technology',
      tags: ['AI', 'Tech'],
      duration: 312,
      createdAt: new Date(now - 2 * 60 * 60 * 1000), // 2 hours ago
      updatedAt: new Date(now - 2 * 60 * 60 * 1000),
    },
    {
      id: '2',
      title: 'Building a Personal Brand on LinkedIn',
      status: 'completed',
      category: 'marketing',
      tags: ['Marketing', 'Business'],
      duration: 456,
      createdAt: new Date(now - 24 * 60 * 60 * 1000), // 1 day ago
      updatedAt: new Date(now - 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      title: 'Productivity Hacks for Remote Workers',
      status: 'completed',
      category: 'productivity',
      tags: ['Productivity', 'Business'],
      duration: 289,
      createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      updatedAt: new Date(now - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: '4',
      title: 'No-Code Tools Transforming Business',
      status: 'completed',
      category: 'business',
      tags: ['Tech', 'Business'],
      duration: 534,
      createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      updatedAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: '5',
      title: 'Automation Strategies for Small Teams',
      status: 'draft',
      category: 'general',
      tags: ['AI', 'Productivity'],
      duration: 178,
      createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      updatedAt: new Date(now - 7 * 24 * 60 * 60 * 1000),
    },
  ];
}

export default function DashboardPage() {
  // Create sessions on client-side only to avoid hydration mismatch
  const mockSessions = useMemo(() => createMockSessions(), []);
  const pendingDrafts = mockSessions.filter(s => s.status === 'draft').length;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back. You have ${pendingDrafts} pending draft${pendingDrafts !== 1 ? 's' : ''}.`}
      />

      {/* Hero Card */}
      <div className="mb-8">
        <HeroCard />
      </div>

      {/* Sessions Table */}
      <SessionsTable sessions={mockSessions} />
    </div>
  );
}

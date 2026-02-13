'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <header className="w-full bg-white dark:bg-[#1a2230] border-b border-[#f0f2f4] dark:border-[#2a3441] sticky top-0 z-50">
      <div className="px-4 md:px-10 py-3 flex items-center justify-between mx-auto max-w-7xl">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 text-[#111318] dark:text-white">
          <div className="size-8 rounded-lg bg-[#135bec]/10 flex items-center justify-center text-[#135bec]">
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
              'text-sm font-medium transition-colors',
              isActive('/dashboard')
                ? 'text-[#135bec] font-bold'
                : 'text-[#616f89] dark:text-[#9ca3af] hover:text-[#135bec]'
            )}
          >
            Dashboard
          </Link>
          <Link
            href="/discover"
            className={cn(
              'text-sm font-medium transition-colors',
              isActive('/discover')
                ? 'text-[#135bec] font-bold'
                : 'text-[#616f89] dark:text-[#9ca3af] hover:text-[#135bec]'
            )}
          >
            Content
          </Link>
          <Link
            href="/settings"
            className={cn(
              'text-sm font-medium transition-colors',
              isActive('/settings')
                ? 'text-[#135bec] font-bold'
                : 'text-[#616f89] dark:text-[#9ca3af] hover:text-[#135bec]'
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

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { label: 'Sessions', href: '/sessions', icon: 'folder_open' },
  { label: 'Templates', href: '/templates', icon: 'auto_awesome' },
  { label: 'Settings', href: '/settings', icon: 'settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="hidden md:flex flex-col w-64 h-full bg-[#F7F7F8] dark:bg-[#151c2a] border-r border-slate-200 dark:border-slate-800">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#135bec] text-white">
          <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
        </div>
        <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
          LadderFlow
        </h1>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-2 flex flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-all group',
              isActive(item.href)
                ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            )}
          >
            <span
              className={cn(
                'material-symbols-outlined text-[20px]',
                isActive(item.href)
                  ? 'text-[#135bec]'
                  : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200'
              )}
            >
              {item.icon}
            </span>
            <span
              className={cn(
                'text-sm font-medium',
                isActive(item.href)
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-200'
              )}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600" />
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-slate-900 dark:text-white">
              Alex Creator
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Pro Plan
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

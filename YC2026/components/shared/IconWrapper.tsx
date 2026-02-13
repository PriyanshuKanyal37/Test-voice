import { cn } from '@/lib/utils';

interface IconWrapperProps {
  icon: string;
  color?: 'indigo' | 'teal' | 'green' | 'orange' | 'pink' | 'purple' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  filled?: boolean;
  className?: string;
}

const colorStyles = {
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  teal: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  pink: 'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  primary: 'bg-[#135bec]/10 text-[#135bec]',
};

const sizeStyles = {
  sm: 'size-8 rounded-md',
  md: 'size-10 rounded-lg',
  lg: 'size-12 rounded-xl',
};

export function IconWrapper({ icon, color = 'primary', size = 'md', filled, className }: IconWrapperProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        colorStyles[color],
        sizeStyles[size],
        className
      )}
    >
      <span className={cn('material-symbols-outlined', filled && 'filled')}>
        {icon}
      </span>
    </div>
  );
}

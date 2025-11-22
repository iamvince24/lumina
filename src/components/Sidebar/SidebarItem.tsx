import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils';

interface SidebarItemProps {
  icon?: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  rightElement?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'ghost';
}

export function SidebarItem({
  icon: Icon,
  label,
  href,
  onClick,
  isActive,
  rightElement,
  className,
  // variant = 'default',
}: SidebarItemProps) {
  const content = (
    <>
      {Icon && (
        <Icon
          className={cn(
            'w-4 h-4',
            isActive
              ? 'text-gray-900'
              : 'text-gray-500 group-hover:text-gray-700'
          )}
        />
      )}
      <span
        className={cn(
          'flex-1 truncate',
          isActive
            ? 'font-medium text-gray-900'
            : 'text-gray-600 group-hover:text-gray-900'
        )}
      >
        {label}
      </span>
      {rightElement}
    </>
  );

  const baseStyles = cn(
    'flex items-center gap-3 px-3 py-1.5 text-sm transition-colors rounded-md group select-none',
    isActive ? 'bg-gray-100' : 'hover:bg-gray-50',
    className
  );

  if (href) {
    return (
      <Link href={href} className={baseStyles}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={cn(baseStyles, 'w-full text-left')}>
      {content}
    </button>
  );
}

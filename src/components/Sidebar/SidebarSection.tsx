import { cn } from '@/lib/utils';

interface SidebarSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function SidebarSection({
  title,
  children,
  className,
  action,
}: SidebarSectionProps) {
  return (
    <div className={cn('mb-6', className)}>
      {title && (
        <div className="flex items-center justify-between px-3 mb-1 group">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {title}
          </h3>
          {action && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              {action}
            </div>
          )}
        </div>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

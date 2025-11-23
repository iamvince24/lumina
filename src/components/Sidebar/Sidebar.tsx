'use client';

import {
  Home,
  Folder,
  Calendar,
  Book,
  Tag,
  PanelLeftClose,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { SidebarItem } from './SidebarItem';
import { SidebarSection } from './SidebarSection';
import { UserDropdown } from './UserDropdown';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils';
import { usePinnedTopics, useRegularTopics } from '@/hooks/useTopics';
import { useTags } from '@/hooks/useTags';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useAuthStore } from '@/stores/authStore';

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { data: pinnedTopics = [], isLoading: isPinnedLoading } =
    usePinnedTopics();
  const { data: regularTopics = [], isLoading: isRegularLoading } =
    useRegularTopics();
  const { data: tags = [], isLoading: isTagsLoading } = useTags();
  const { isCollapsed, toggleSidebar } = useSidebarStore();
  const user = useAuthStore((state) => state.user);

  const isActive = (href: string) => {
    if (!href) return false;
    // 精確匹配主要導航項目
    if (
      href === '/today' ||
      href === '/calendar' ||
      href === '/topics' ||
      href === '/topics' ||
      href === '/tags'
    ) {
      return pathname === href;
    }
    // 動態路由匹配 (topic 和 tag)
    if (href.startsWith('/topics/') || href.startsWith('/tag/')) {
      return pathname === href;
    }
    return false;
  };

  return (
    <>
      {/* Toggle Button - Always in top-left corner */}
      <button
        onClick={toggleSidebar}
        title="Toggle sidebar visibility • ⌘ \"
        className={cn(
          'fixed z-50 p-1 rounded-lg',
          // 'bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-sm',
          'hover:bg-gray-50 transition-all duration-300',
          'text-gray-700 hover:text-gray-900'
        )}
      >
        <PanelLeftClose
          className={cn(
            'w-5 h-5 transition-transform duration-300',
            isCollapsed && 'rotate-180'
          )}
        />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-[#FBFBFB] flex flex-col text-gray-700 font-sans',
          'transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-0 opacity-0' : 'w-[280px] opacity-100',
          className,
          'mt-[40px]'
        )}
      >
        {!isCollapsed && (
          <>
            {/* User Workspace Switcher */}
            {!user ? (
              <div className="p-2 mb-2">
                <div className="flex items-center gap-2 w-full p-1.5">
                  <Skeleton className="w-6 h-6 rounded bg-gray-200" />
                  <Skeleton className="flex-1 h-4 bg-gray-200" />
                  <Skeleton className="w-4 h-4 bg-gray-200" />
                </div>
              </div>
            ) : (
              <UserDropdown />
            )}

            <div className="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar">
              {/* Main Navigation */}
              <div className="mb-6 space-y-0.5">
                <SidebarItem
                  icon={Home}
                  label="Today"
                  href="/today"
                  isActive={isActive('/today')}
                />
                <SidebarItem
                  icon={Calendar}
                  label="Calendar"
                  href="/calendar"
                  isActive={isActive('/calendar')}
                />
                <SidebarItem
                  icon={Folder}
                  label="All Topics"
                  href="/topics"
                  isActive={isActive('/topics')}
                />
                <SidebarItem
                  icon={Tag}
                  label="All Tags"
                  href="/tags"
                  isActive={isActive('/tags')}
                />
              </div>

              {/* Pinned Section */}
              {isPinnedLoading ? (
                <SidebarSection title="Pinned">
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-3 py-1.5"
                      >
                        <Skeleton className="h-4 flex-1 bg-gray-200" />
                      </div>
                    ))}
                  </div>
                </SidebarSection>
              ) : pinnedTopics.length > 0 ? (
                <SidebarSection title="Pinned">
                  {pinnedTopics.map((topic) => (
                    <SidebarItem
                      key={topic.id}
                      icon={Book}
                      label={topic.name}
                      href={`/topics/${topic.id}`}
                      isActive={isActive(`/topics/${topic.id}`)}
                    />
                  ))}
                </SidebarSection>
              ) : null}

              {/* Topics Section */}
              {isRegularLoading ? (
                <SidebarSection title="Topics">
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-3 py-1.5"
                      >
                        <Skeleton className="h-4 flex-1 bg-gray-200" />
                      </div>
                    ))}
                  </div>
                </SidebarSection>
              ) : regularTopics.length > 0 ? (
                <SidebarSection title="Topics">
                  {regularTopics.map((topic) => (
                    <SidebarItem
                      key={topic.id}
                      icon={Book}
                      label={topic.name}
                      href={`/topics/${topic.id}`}
                      isActive={isActive(`/topics/${topic.id}`)}
                    />
                  ))}
                </SidebarSection>
              ) : null}

              {/* Tags Section */}
              {isTagsLoading ? (
                <SidebarSection title="Tags">
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-3 py-1.5"
                      >
                        <Skeleton className="h-4 flex-1 bg-gray-200" />
                      </div>
                    ))}
                  </div>
                </SidebarSection>
              ) : tags.length > 0 ? (
                <SidebarSection title="Tags">
                  {tags.map((tag) => (
                    <SidebarItem
                      key={tag.id}
                      label={tag.name}
                      href={`/tag/${tag.id}`}
                      isActive={isActive(`/tag/${tag.id}`)}
                      rightElement={
                        tag.usageCount > 0 ? (
                          <span className="text-gray-500">
                            {tag.usageCount}
                          </span>
                        ) : null
                      }
                    />
                  ))}
                </SidebarSection>
              ) : null}
            </div>
          </>
        )}
      </aside>
    </>
  );
}

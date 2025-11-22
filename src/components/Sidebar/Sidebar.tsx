'use client';

import { Home, Folder, Calendar, Book, Tag } from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import { SidebarSection } from './SidebarSection';
import { UserDropdown } from './UserDropdown';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils';
import { usePinnedTopics, useRegularTopics } from '@/hooks/useTopics';
import { useTags } from '@/hooks/useTags';

export function Sidebar({ className }: { className?: string }) {
  const { data: pinnedTopics = [], isLoading: isPinnedLoading } =
    usePinnedTopics();
  const { data: regularTopics = [], isLoading: isRegularLoading } =
    useRegularTopics();
  const { data: tags = [], isLoading: isTagsLoading } = useTags();

  return (
    <aside
      className={cn(
        'w-[280px] bg-[#FBFBFB] flex flex-col text-gray-700 font-sans',
        className
      )}
    >
      {/* User Workspace Switcher */}
      <UserDropdown />

      <div className="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar">
        {/* Main Navigation */}
        <div className="mb-6 space-y-0.5">
          <SidebarItem icon={Home} label="Today" href="/today" isActive />
          <SidebarItem icon={Calendar} label="Calendar" href="/calendar" />
          <SidebarItem icon={Folder} label="All Topics" href="/topics" />
          <SidebarItem icon={Tag} label="All Tags" href="/all-tags" />
        </div>

        {/* Pinned Section */}
        {isPinnedLoading ? (
          <SidebarSection title="Pinned">
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-1.5">
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
                href={`/topic/${topic.id}`}
              />
            ))}
          </SidebarSection>
        ) : null}

        {/* Topics Section */}
        {isRegularLoading ? (
          <SidebarSection title="Topics">
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-1.5">
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
                href={`/topic/${topic.id}`}
              />
            ))}
          </SidebarSection>
        ) : null}

        {/* Tags Section */}
        {isTagsLoading ? (
          <SidebarSection title="Tags">
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-1.5">
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
                rightElement={
                  tag.usageCount > 0 ? (
                    <span className="text-gray-500">{tag.usageCount}</span>
                  ) : null
                }
              />
            ))}
          </SidebarSection>
        ) : null}
      </div>
    </aside>
  );
}

'use client';

import {
  PlusCircle,
  Files,
  CheckCircle2,
  Calendar,
  Share2,
} from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import { SidebarSection } from './SidebarSection';
import { UserDropdown } from './UserDropdown';
import { FolderTree } from './FolderTree';
import { cn } from '@/lib/utils';

// Mock data for tags
const mockTags = [
  { id: 'react', name: 'react' },
  { id: 'javascript', name: 'javascript' },
  { id: 'reading', name: '曼陀號' },
  { id: 'toread', name: 'toread' },
  { id: 'lecture', name: 'lecture' },
  { id: 'newsletter', name: 'newsletter' },
];

// Mock data for starred
const mockStarred = [
  { id: 'learning', name: 'Learning Collection', type: 'doc' },
  { id: 'tech-blog', name: 'Tech Blog', type: 'doc' },
  {
    id: 'handbook',
    name: 'The Front End Developer/Engineer Handbook',
    type: 'doc',
  },
  { id: 'toread-list', name: 'To Read List 2025', type: 'doc' },
  { id: 'week-routine', name: 'Week Routine', type: 'doc' },
];

export function Sidebar({ className }: { className?: string }) {
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
        {/* New Document Button */}
        <div className="mb-4">
          <SidebarItem
            icon={PlusCircle}
            label="New Document"
            onClick={() => {}}
            className="text-gray-600"
          />
        </div>

        {/* Main Navigation */}
        <div className="mb-6 space-y-0.5">
          <SidebarItem
            icon={Files}
            label="All Docs"
            href="/all-docs"
            isActive
          />
          <SidebarItem icon={CheckCircle2} label="Tasks" href="/tasks" />
          <SidebarItem icon={Calendar} label="Calendar" href="/calendar" />
          <SidebarItem icon={Share2} label="Shared with Me" href="/shared" />
        </div>

        {/* Starred Section */}
        <SidebarSection title="Starred">
          {mockStarred.map((item) => (
            <SidebarItem
              key={item.id}
              label={item.name}
              icon={Files} // Using generic file icon for now
              href={`/doc/${item.id}`}
              className="text-gray-600"
            />
          ))}
        </SidebarSection>

        {/* Tags Section */}
        <SidebarSection title="Tags">
          {mockTags.map((tag) => (
            <SidebarItem
              key={tag.id}
              label={`# ${tag.name}`}
              href={`/tag/${tag.id}`}
              className="text-gray-600"
            />
          ))}
        </SidebarSection>

        {/* Folders Section */}
        <SidebarSection title="Folders">
          <FolderTree />
        </SidebarSection>
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-gray-200">
        {/* Could add settings or other bottom links here if needed */}
      </div>
    </aside>
  );
}

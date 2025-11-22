import { useState } from 'react';
import { ChevronRight, Folder, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

// Mock data matching the image roughly
const mockFolders: FileNode[] = [
  {
    id: 'design-pattern',
    name: 'Design Pattern',
    type: 'folder',
    children: [],
  },
  {
    id: 'collection',
    name: 'Collection',
    type: 'folder',
    children: [
      { id: 'learning', name: 'Learning Collection', type: 'file' },
      { id: 'book-club', name: 'Book club', type: 'file' },
      { id: 'blog', name: 'Blog Collection', type: 'file' },
      { id: 'recent', name: 'Recently Topic', type: 'file' },
    ],
  },
  {
    id: 'interview',
    name: 'Interview record',
    type: 'folder',
    children: [],
  },
  {
    id: 'consultation',
    name: 'Consultation',
    type: 'folder',
    children: [],
  },
  {
    id: 'lecture',
    name: 'Lecture',
    type: 'folder',
    children: [],
  },
];

interface FolderItemProps {
  node: FileNode;
  level: number;
}

function FolderItem({ node, level }: FolderItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  // const hasChildren =
  //   node.type === 'folder' && node.children && node.children.length > 0;

  // const Icon = node.type === 'folder' ? Folder : FileText;

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer select-none transition-colors',
          level > 0 && 'ml-4'
        )}
        onClick={handleClick}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
      >
        <div className="w-4 h-4 flex items-center justify-center shrink-0">
          {node.type === 'folder' && (
            <ChevronRight
              className={cn(
                'w-3 h-3 text-gray-400 transition-transform',
                isOpen && 'transform rotate-90'
              )}
            />
          )}
        </div>
        {/* <Icon className="w-4 h-4 text-gray-400" /> */}
        <span className="truncate">{node.name}</span>
      </div>
      {isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FolderItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FolderTree() {
  return (
    <div className="space-y-0.5">
      {mockFolders.map((folder) => (
        <FolderItem key={folder.id} node={folder} level={0} />
      ))}
    </div>
  );
}

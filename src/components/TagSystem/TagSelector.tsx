'use client';

import { useEffect, useState } from 'react';
import { useTagStore } from '@/stores/tagStore';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { getTagsAction } from '@/app/actions/tagActions';
import { Tag } from '@/types/tag';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function TagSelector() {
  const { isSelectorOpen, setSelectorOpen } = useTagStore();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isSelectorOpen) {
      (async () => {
        setIsLoading(true);
        const result = await getTagsAction();
        if (result.success && result.data) {
          setTags(result.data);
        }
        setIsLoading(false);
      })();
    }
  }, [isSelectorOpen]);

  const handleSelect = (tagId: string) => {
    setSelectorOpen(false);
    router.push(`/tags/${tagId}`);
  };

  return (
    <CommandDialog open={isSelectorOpen} onOpenChange={setSelectorOpen}>
      <CommandInput placeholder="搜尋標籤..." />
      <CommandList>
        <CommandEmpty>找不到標籤</CommandEmpty>
        {isLoading ? (
          <div className="py-6 text-center text-sm text-gray-500 flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            載入中...
          </div>
        ) : (
          <CommandGroup heading="所有標籤">
            {tags.map((tag) => (
              <CommandItem
                key={tag.id}
                value={tag.name}
                onSelect={() => handleSelect(tag.id)}
                className="cursor-pointer"
              >
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: tag.color }}
                />
                <span>{tag.name}</span>
                <span className="ml-auto text-xs text-gray-400">
                  {tag.usageCount} nodes
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

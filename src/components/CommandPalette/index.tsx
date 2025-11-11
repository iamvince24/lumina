/**
 * 命令面板組件
 * 快捷鍵 Cmd+K 開啟
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHotkeys } from 'react-hotkeys-hook';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Calendar, FileText, Hash, Download, Plus, Layout } from 'lucide-react';
// ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
import { useMockRecentTopics } from '@/__mocks__/hooks';

/**
 * 命令面板組件
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
  const { data: topics } = useMockRecentTopics(10);

  /**
   * 註冊快捷鍵
   */
  useHotkeys('cmd+k, ctrl+k', (e) => {
    e.preventDefault();
    setOpen(true);
  });

  /**
   * 處理命令執行
   */
  const handleCommand = (callback: () => void) => {
    setOpen(false);
    callback();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="輸入命令或搜尋..." />
      <CommandList>
        <CommandEmpty>找不到結果</CommandEmpty>

        {/* 快速操作 */}
        <CommandGroup heading="快速操作">
          <CommandItem
            onSelect={() =>
              handleCommand(() => {
                // TODO: 開啟新增 Topic Dialog
                console.log('Add new topic');
              })
            }
          >
            <Plus className="w-4 h-4 mr-2" />
            新增 Topic
          </CommandItem>

          <CommandItem
            onSelect={() =>
              handleCommand(() => {
                router.push('/today');
              })
            }
          >
            <FileText className="w-4 h-4 mr-2" />
            今天的編輯頁面
          </CommandItem>

          <CommandItem
            onSelect={() =>
              handleCommand(() => {
                router.push('/calendar');
              })
            }
          >
            <Calendar className="w-4 h-4 mr-2" />
            月曆視圖
          </CommandItem>

          <CommandItem
            onSelect={() =>
              handleCommand(() => {
                // TODO: 開啟匯出 Dialog
                console.log('Export');
              })
            }
          >
            <Download className="w-4 h-4 mr-2" />
            匯出
          </CommandItem>
        </CommandGroup>

        {/* Topics */}
        {topics && topics.length > 0 && (
          <CommandGroup heading="Topics">
            {topics.slice(0, 5).map((topic) => (
              <CommandItem
                key={topic.id}
                onSelect={() =>
                  handleCommand(() => {
                    router.push(`/topics/${topic.id}`);
                  })
                }
              >
                <Hash className="w-4 h-4 mr-2" />
                {topic.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* 視圖切換 */}
        <CommandGroup heading="視圖">
          <CommandItem
            onSelect={() =>
              handleCommand(() => {
                // TODO: 切換到 Radial 視圖
                console.log('Switch to radial view');
              })
            }
          >
            <Layout className="w-4 h-4 mr-2" />
            放射狀視圖
          </CommandItem>

          <CommandItem
            onSelect={() =>
              handleCommand(() => {
                // TODO: 切換到 Outliner 視圖
                console.log('Switch to outliner view');
              })
            }
          >
            <Layout className="w-4 h-4 mr-2" />
            大綱視圖
          </CommandItem>

          <CommandItem
            onSelect={() =>
              handleCommand(() => {
                // TODO: 切換到 Logic Chart 視圖
                console.log('Switch to logic chart view');
              })
            }
          >
            <Layout className="w-4 h-4 mr-2" />
            邏輯圖視圖
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

/**
 * Tag 狀態管理 Store
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tag, TagFilter } from '@/types/tag';

interface TagState {
  /** 所有 Tags */
  tags: Tag[];

  /** 當前的篩選條件 */
  activeFilter: TagFilter | null;

  /** 設定 Tags */
  setTags: (tags: Tag[]) => void;

  /** 新增 Tag */
  addTag: (tag: Tag) => void;

  /** 更新 Tag */
  updateTag: (tagId: string, updates: Partial<Tag>) => void;

  /** 刪除 Tag */
  deleteTag: (tagId: string) => void;

  /** 設定篩選條件 */
  setFilter: (filter: TagFilter | null) => void;

  /** 清除篩選 */
  clearFilter: () => void;

  /** 全域 Tag 選擇器狀態 */
  isSelectorOpen: boolean;
  setSelectorOpen: (isOpen: boolean) => void;
}

/**
 * Tag Store
 */
export const useTagStore = create<TagState>()(
  persist(
    (set) => ({
      tags: [],
      activeFilter: null,

      setTags: (tags) => set({ tags }),

      addTag: (tag) =>
        set((state) => ({
          tags: [...state.tags, tag],
        })),

      updateTag: (tagId, updates) =>
        set((state) => ({
          tags: state.tags.map((tag) =>
            tag.id === tagId ? { ...tag, ...updates } : tag
          ),
        })),

      deleteTag: (tagId) =>
        set((state) => ({
          tags: state.tags.filter((tag) => tag.id !== tagId),
        })),

      setFilter: (filter) => set({ activeFilter: filter }),

      clearFilter: () => set({ activeFilter: null }),

      isSelectorOpen: false,
      setSelectorOpen: (isOpen) => set({ isSelectorOpen: isOpen }),
    }),
    {
      name: 'lumina-tags',
      partialize: (state) => ({
        tags: state.tags,
        // Exclude isSelectorOpen and activeFilter from persistence if desired,
        // but keeping tags persisted is good for offline/cache.
      }),
    }
  )
);

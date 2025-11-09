/**
 * Topic 狀態管理 Store
 * 管理所有 Topic 相關的狀態和操作
 */

import { create } from 'zustand';
import { devtools, persist, type StorageValue } from 'zustand/middleware';
import type {
  Topic,
  CreateTopicParams,
  UpdateTopicParams,
  TopicStats,
} from '@/types/topic';

// ========================================
// Store 介面定義
// ========================================

interface TopicStore {
  // === 狀態 ===
  /** 所有 Topics */
  topics: Topic[];

  /** 釘選的 Topic IDs */
  pinnedTopicIds: string[];

  /** 當前選中的 Topic ID */
  selectedTopicId: string | null;

  /** 是否正在載入 */
  isLoading: boolean;

  /** 錯誤訊息 */
  error: string | null;

  // === Topic 操作 ===
  /** 建立 Topic */
  createTopic: (params: CreateTopicParams) => Topic;

  /** 更新 Topic */
  updateTopic: (params: UpdateTopicParams) => void;

  /** 刪除 Topic */
  deleteTopic: (topicId: string) => void;

  /** 釘選/取消釘選 Topic */
  togglePinTopic: (topicId: string) => void;

  // === 查詢操作 ===
  /** 根據 ID 取得 Topic */
  getTopicById: (topicId: string) => Topic | undefined;

  /** 取得所有釘選的 Topics */
  getPinnedTopics: () => Topic[];

  /** 取得 Topic 的子 Topics */
  getChildTopics: (parentTopicId: string) => Topic[];

  // === 統計資訊 ===
  /** 取得 Topic 的統計資訊 */
  getTopicStats: (topicId: string) => TopicStats | null;

  // === 資料載入 ===
  /** 載入所有 Topics */
  loadTopics: (topics: Topic[]) => void;

  /** 重置 Store */
  reset: () => void;
}

// ========================================
// 初始狀態
// ========================================

const initialState = {
  topics: [],
  pinnedTopicIds: [],
  selectedTopicId: null,
  isLoading: false,
  error: null,
};

// ========================================
// Store 實作
// ========================================

export const useTopicStore = create<TopicStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // === Topic 操作 ===

        createTopic: (params: CreateTopicParams) => {
          const newTopic: Topic = {
            id: `topic_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            name: params.name,
            color: params.color,
            parentTopicId: params.parentTopicId,
            isPinned: params.isPinned || false,
            createdAt: new Date(),
            updatedAt: new Date(),
            accumulationCount: 0,
            userId: 'current-user-id', // TODO: 從 auth 取得
          };

          set((state) => ({
            topics: [...state.topics, newTopic],
            pinnedTopicIds: newTopic.isPinned
              ? [...state.pinnedTopicIds, newTopic.id]
              : state.pinnedTopicIds,
          }));

          return newTopic;
        },

        updateTopic: (params: UpdateTopicParams) => {
          set((state) => {
            const updatedTopics = state.topics.map((topic) =>
              topic.id === params.id
                ? {
                    ...topic,
                    ...params.data,
                    updatedAt: new Date(),
                  }
                : topic
            );

            // 如果更新了 isPinned，同步更新 pinnedTopicIds
            const updatedTopic = updatedTopics.find((t) => t.id === params.id);
            let newPinnedTopicIds = state.pinnedTopicIds;

            if (updatedTopic && params.data.isPinned !== undefined) {
              if (updatedTopic.isPinned) {
                // 釘選
                if (!state.pinnedTopicIds.includes(updatedTopic.id)) {
                  newPinnedTopicIds = [
                    ...state.pinnedTopicIds,
                    updatedTopic.id,
                  ];
                }
              } else {
                // 取消釘選
                newPinnedTopicIds = state.pinnedTopicIds.filter(
                  (id) => id !== updatedTopic.id
                );
              }
            }

            return {
              topics: updatedTopics,
              pinnedTopicIds: newPinnedTopicIds,
            };
          });
        },

        deleteTopic: (topicId: string) => {
          set((state) => ({
            topics: state.topics.filter((t) => t.id !== topicId),
            pinnedTopicIds: state.pinnedTopicIds.filter((id) => id !== topicId),
            selectedTopicId:
              state.selectedTopicId === topicId ? null : state.selectedTopicId,
          }));
        },

        togglePinTopic: (topicId: string) => {
          set((state) => {
            const isPinned = state.pinnedTopicIds.includes(topicId);

            return {
              topics: state.topics.map((topic) =>
                topic.id === topicId ? { ...topic, isPinned: !isPinned } : topic
              ),
              pinnedTopicIds: isPinned
                ? state.pinnedTopicIds.filter((id) => id !== topicId)
                : [...state.pinnedTopicIds, topicId],
            };
          });
        },

        // === 查詢操作 ===

        getTopicById: (topicId: string) => {
          return get().topics.find((t) => t.id === topicId);
        },

        getPinnedTopics: () => {
          const { topics, pinnedTopicIds } = get();
          return topics.filter((t) => pinnedTopicIds.includes(t.id));
        },

        getChildTopics: (parentTopicId: string) => {
          return get().topics.filter((t) => t.parentTopicId === parentTopicId);
        },

        // === 統計資訊 ===

        getTopicStats: (topicId: string) => {
          const topic = get().getTopicById(topicId);
          if (!topic) return null;

          // TODO: 從 MindMap Store 計算實際統計
          return {
            topicId,
            totalEntries: topic.accumulationCount,
            totalNodes: 0,
            lastUpdated: topic.updatedAt,
            firstCreated: topic.createdAt,
          };
        },

        // === 資料載入 ===

        loadTopics: (topics: Topic[]) => {
          set({
            topics,
            pinnedTopicIds: topics.filter((t) => t.isPinned).map((t) => t.id),
            isLoading: false,
            error: null,
          });
        },

        reset: () => {
          set(initialState);
        },
      }),
      {
        name: 'topic-storage',
        // 自訂序列化，因為 Date 無法直接序列化
        storage: {
          getItem: (name: string) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const parsed = JSON.parse(str);
            return {
              state: {
                ...parsed.state,
                topics: parsed.state.topics?.map(
                  (topic: {
                    id: string;
                    name: string;
                    color: string;
                    parentTopicId?: string;
                    isPinned: boolean;
                    createdAt: string;
                    updatedAt: string;
                    accumulationCount: number;
                    userId: string;
                  }) => ({
                    ...topic,
                    createdAt: new Date(topic.createdAt),
                    updatedAt: new Date(topic.updatedAt),
                  })
                ),
              },
              version: parsed.version,
            } as StorageValue<TopicStore>;
          },
          setItem: (name: string, value: StorageValue<TopicStore>) => {
            const serialized = {
              state: {
                ...value.state,
                topics: value.state.topics.map((topic) => ({
                  ...topic,
                  createdAt: topic.createdAt.toISOString(),
                  updatedAt: topic.updatedAt.toISOString(),
                })),
              },
              version: value.version,
            };
            localStorage.setItem(name, JSON.stringify(serialized));
          },
          removeItem: (name: string) => localStorage.removeItem(name),
        },
      }
    ),
    { name: 'TopicStore' }
  )
);

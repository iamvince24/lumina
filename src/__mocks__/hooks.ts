/**
 * Mock API Hooks
 * 模擬 tRPC hooks 的介面，方便未來切換到真實 API
 */

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  MOCK_TOPICS,
  MOCK_MINDMAPS,
  MOCK_TOPIC_NODES,
  MOCK_DELETED_TOPICS,
  MOCK_DELETED_NODES,
  MOCK_DELETED_MINDMAPS,
  MOCK_CALENDAR_ENTRIES,
  type DeletedTopic,
  type DeletedNode,
  type DeletedMindMap,
} from './data';
import type { MockTopic, MockMindMap, MockTopicNodes } from './types';
import type { Node, Edge } from '@/types/mindmap';
import type { Tag } from '@/types/tag';

/**
 * 模擬 API 延遲
 */
const mockDelay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Hook 回傳格式
 */
interface UseQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch?: () => void;
}

/**
 * Mock: 取得最近的 Topics
 */
export function useMockRecentTopics(
  limit: number = 10
): UseQueryResult<MockTopic[]> {
  const [data, setData] = useState<MockTopic[] | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await mockDelay(300);
        // 按最後更新時間排序，取前 N 個
        const sorted = [...MOCK_TOPICS]
          .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
          .slice(0, limit);
        setData(sorted);
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [limit]);

  return { data, isLoading, error };
}

/**
 * Mock: 根據 ID 取得 Topic
 */
export function useMockTopicById(topicId: string): UseQueryResult<MockTopic> {
  const [data, setData] = useState<MockTopic | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await mockDelay(300);
        const topic = MOCK_TOPICS.find((t) => t.id === topicId);
        if (!topic) {
          throw new Error(`Topic not found: ${topicId}`);
        }
        setData(topic);
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [topicId]);

  return { data, isLoading, error };
}

/**
 * Mock: 根據日期取得 MindMap
 */
export function useMockMindMapByDate(date: Date): UseQueryResult<MockMindMap> {
  const [data, setData] = useState<MockMindMap | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await mockDelay(300);
        const dateStr = format(date, 'yyyy-MM-dd');
        const mindmap = MOCK_MINDMAPS[dateStr];

        if (!mindmap) {
          // 如果沒有資料，建立一個新的
          const newMindMap: MockMindMap = {
            id: `mindmap-${dateStr}`,
            date: dateStr,
            title: `心智圖 ${format(date, 'yyyy/MM/dd')}`,
            nodes: [],
            edges: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setData(newMindMap);
        } else {
          setData(mindmap);
        }
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [date]);

  return { data, isLoading, error };
}

/**
 * Mock: 取得 Topic 的所有 Nodes
 */
export function useMockTopicNodes(
  topicId: string
): UseQueryResult<MockTopicNodes> {
  const [data, setData] = useState<MockTopicNodes | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await mockDelay(300);
        const topicNodes = MOCK_TOPIC_NODES[topicId];
        if (!topicNodes) {
          // 如果沒有資料，回傳空陣列
          setData({ nodes: [], edges: [] });
        } else {
          setData(topicNodes);
        }
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [topicId]);

  return { data, isLoading, error };
}

/**
 * Mock: 更新 Topic 名稱 (僅前端狀態)
 */
export function useMockUpdateTopicName() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (params: { topicId: string; name: string }) => {
    setIsLoading(true);
    await mockDelay(500);

    // 在實際應用中，這裡會更新 MOCK_TOPICS
    // 但由於是 const，我們只做模擬
    console.log('Mock: Update topic name', params);

    setIsLoading(false);
  };

  return {
    mutate,
    isLoading,
  };
}

/**
 * Mock: 更新 MindMap (僅前端狀態)
 * ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
 */
export function useMockUpdateMindMap(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (params: {
    mindmapId: string;
    nodes: Node[];
    edges: Edge[];
  }) => {
    setIsPending(true);
    try {
      await mockDelay(500);

      // 在實際應用中，這裡會更新 MOCK_MINDMAPS
      // 但由於是 const，我們只做模擬
      console.log('Mock: Update mindmap', params);

      options?.onSuccess?.();
    } catch (error) {
      options?.onError?.(error as Error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    mutate,
    isPending,
    isLoading: isPending,
  };
}

/**
 * Mock: 登入 API
 * ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
 */
export function useMockSignIn(options?: {
  onSuccess?: (data: {
    user: { id: string; email: string; name: string };
    token: string;
  }) => void;
  onError?: (error: Error) => void;
}) {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (params: { email: string; password: string }) => {
    setIsPending(true);
    try {
      await mockDelay(500);

      // 模擬登入驗證
      // 預設帳號：test@example.com / Test1234
      if (
        params.email === 'test@example.com' &&
        params.password === 'Test1234'
      ) {
        const mockUser = {
          user: {
            id: 'user-1',
            email: 'test@example.com',
            name: '測試使用者',
          },
          token: 'mock-jwt-token-' + Date.now(),
        };

        // 設定 cookie（模擬）
        if (typeof document !== 'undefined') {
          document.cookie = `lumina-auth=${mockUser.token}; path=/; max-age=86400`;
        }

        options?.onSuccess?.(mockUser);
        return mockUser;
      } else {
        const error = new Error('帳號或密碼錯誤');
        options?.onError?.(error);
        throw error;
      }
    } catch (error) {
      options?.onError?.(error as Error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    mutate,
    isPending,
    isLoading: isPending,
  };
}

/**
 * Mock: 註冊 API
 * ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
 */
export function useMockSignUp(options?: {
  onSuccess?: (data: {
    user: { id: string; email: string; name: string };
    token: string;
  }) => void;
  onError?: (error: Error) => void;
}) {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (params: {
    name: string;
    email: string;
    password: string;
  }) => {
    setIsPending(true);
    try {
      await mockDelay(500);

      // 模擬註冊（檢查 email 是否已存在）
      if (params.email === 'test@example.com') {
        const error = new Error('此 Email 已被註冊');
        options?.onError?.(error);
        throw error;
      }

      // 建立新使用者
      const mockUser = {
        user: {
          id: 'user-' + Date.now(),
          email: params.email,
          name: params.name,
        },
        token: 'mock-jwt-token-' + Date.now(),
      };

      // 設定 cookie（模擬）
      if (typeof document !== 'undefined') {
        document.cookie = `lumina-auth=${mockUser.token}; path=/; max-age=86400`;
      }

      options?.onSuccess?.(mockUser);
      return mockUser;
    } catch (error) {
      options?.onError?.(error as Error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    mutate,
    isPending,
    isLoading: isPending,
  };
}

/**
 * Mock: 登出 API
 * ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
 */
export function useMockSignOut(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const [isPending, setIsPending] = useState(false);

  const mutate = async () => {
    setIsPending(true);
    try {
      await mockDelay(300);

      // 清除 cookie（模擬）
      if (typeof document !== 'undefined') {
        document.cookie = 'lumina-auth=; path=/; max-age=0';
      }

      options?.onSuccess?.();
    } catch (error) {
      options?.onError?.(error as Error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    mutate,
    isPending,
    isLoading: isPending,
  };
}

/**
 * Mock: 建立 Tag
 * ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
 */
export function useMockCreateTag(options?: {
  onSuccess?: (tag: Tag) => void;
  onError?: (error: Error) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (params: {
    name: string;
    color: string;
  }): Promise<Tag> => {
    setIsLoading(true);
    try {
      await mockDelay(300);

      const newTag: Tag = {
        id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: params.name,
        color: params.color,
        createdAt: new Date(),
        usageCount: 0,
      };

      options?.onSuccess?.(newTag);
      return newTag;
    } catch (error) {
      options?.onError?.(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate,
    isLoading,
  };
}

/**
 * Mock: 取得所有 Tags
 * ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
 */
export function useMockGetAllTags(): UseQueryResult<Tag[]> {
  const [data, setData] = useState<Tag[] | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await mockDelay(300);
        // 模擬從 localStorage 或 API 取得 Tags
        // 實際應從後端 API 取得
        const mockTags: Tag[] = [];
        setData(mockTags);
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
}

/**
 * Mock: 更新 Node 的 Tags
 * ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
 */
export function useMockUpdateNodeTags(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (params: { nodeId: string; tagIds: string[] }) => {
    setIsLoading(true);
    try {
      await mockDelay(300);
      // 模擬更新 Node Tags
      console.log('Mock: Update node tags', params);
      options?.onSuccess?.();
    } catch (error) {
      options?.onError?.(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate,
    isLoading,
  };
}

/**
 * Mock: 取得已刪除的 Topics
 * ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
 */
export function useMockGetDeletedTopics(): UseQueryResult<DeletedTopic[]> {
  const [data, setData] = useState<DeletedTopic[] | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await mockDelay(300);
      setData(MOCK_DELETED_TOPICS);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error, refetch: fetchData };
}

/**
 * Mock: 取得已刪除的 Nodes
 * ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
 */
export function useMockGetDeletedNodes(): UseQueryResult<DeletedNode[]> {
  const [data, setData] = useState<DeletedNode[] | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await mockDelay(300);
      setData(MOCK_DELETED_NODES);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error, refetch: fetchData };
}

/**
 * Mock: 取得已刪除的 MindMaps
 * ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
 */
export function useMockGetDeletedMindMaps(): UseQueryResult<DeletedMindMap[]> {
  const [data, setData] = useState<DeletedMindMap[] | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await mockDelay(300);
      setData(MOCK_DELETED_MINDMAPS);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error, refetch: fetchData };
}

/**
 * Mock: 復原 Topic
 * ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
 */
export function useMockRestoreTopic(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (params: { topicId: string }) => {
    setIsLoading(true);
    try {
      await mockDelay(300);
      // 模擬復原 Topic
      console.log('Mock: Restore topic', params);
      options?.onSuccess?.();
    } catch (error) {
      options?.onError?.(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate,
    isLoading,
  };
}

/**
 * Mock: 永久刪除 Topic
 * ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
 */
export function useMockPermanentDeleteTopic(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (params: { topicId: string }) => {
    setIsLoading(true);
    try {
      await mockDelay(300);
      // 模擬永久刪除 Topic
      console.log('Mock: Permanent delete topic', params);
      options?.onSuccess?.();
    } catch (error) {
      options?.onError?.(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate,
    isLoading,
  };
}

/**
 * Mock: 取得使用者設定
 * ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
 */
export function useMockGetUserSettings(): UseQueryResult<any> {
  const [data, setData] = useState<any | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await mockDelay(300);
        // 從 localStorage 取得或使用預設值
        const savedSettings = localStorage.getItem('user-settings');
        if (savedSettings) {
          setData(JSON.parse(savedSettings));
        } else {
          // 使用預設設定
          const { MOCK_USER_SETTINGS } = await import('./settingsData');
          setData(MOCK_USER_SETTINGS);
        }
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
}

/**
 * Mock: 更新使用者設定
 * ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
 */
export function useMockUpdateUserSettings(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (params: any) => {
    setIsLoading(true);
    try {
      await mockDelay(300);
      // 儲存到 localStorage
      localStorage.setItem('user-settings', JSON.stringify(params));
      options?.onSuccess?.();
    } catch (error) {
      options?.onError?.(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate,
    isLoading,
  };
}

/**
 * Mock: 取得月曆資料
 * ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
 */
export function useMockGetCalendarEntries(params: {
  year: number;
  month: number;
}): UseQueryResult<
  Record<
    string,
    {
      date: string;
      hasContent: boolean;
      nodeCount: number;
      topicCount: number;
      preview?: string;
    }
  >
> {
  const [data, setData] = useState<any | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await mockDelay(300);
        // 過濾出指定月份的資料
        const filteredEntries = Object.entries(MOCK_CALENDAR_ENTRIES).reduce(
          (acc, [key, value]) => {
            const date = new Date(key);
            if (
              date.getFullYear() === params.year &&
              date.getMonth() + 1 === params.month
            ) {
              acc[key] = value;
            }
            return acc;
          },
          {} as any
        );
        setData(filteredEntries);
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.year, params.month]);

  return { data, isLoading, error };
}

/**
 * Mock: 取得所有 Topics（用於 topics 列表頁）
 * ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
 */
export function useMockAllTopics(): UseQueryResult<MockTopic[]> {
  const [data, setData] = useState<MockTopic[] | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await mockDelay(300);
        // 按最後更新時間排序
        const sorted = [...MOCK_TOPICS].sort(
          (a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime()
        );
        setData(sorted);
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
}

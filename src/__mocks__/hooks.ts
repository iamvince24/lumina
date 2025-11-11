/**
 * Mock API Hooks
 * 模擬 tRPC hooks 的介面，方便未來切換到真實 API
 */

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { MOCK_TOPICS, MOCK_MINDMAPS, MOCK_TOPIC_NODES } from './data';
import type { MockTopic, MockMindMap, MockTopicNodes } from './types';

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

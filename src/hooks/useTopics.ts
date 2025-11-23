import { useQuery } from '@tanstack/react-query';
import type { Topic, ParentTopicWithChildren } from '@/types/topic';

interface TopicsResponse {
  data: Topic[];
  success: boolean;
}

interface ParentTopicsResponse {
  data: ParentTopicWithChildren[];
  success: boolean;
}

type TopicType = 'all' | 'pinned' | 'regular';

/**
 * 從 API 獲取 topics 資料
 */
async function fetchTopics(type: TopicType = 'all'): Promise<Topic[]> {
  const url = `/api/topics${type !== 'all' ? `?type=${type}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch topics');
  }

  const result: TopicsResponse = await response.json();
  return result.data;
}

/**
 * React Query hook - 取得所有 topics
 */
export function useTopics(type: TopicType = 'all') {
  return useQuery({
    queryKey: ['topics', type],
    queryFn: () => fetchTopics(type),
    staleTime: 5 * 60 * 1000, // 5 分鐘
  });
}

/**
 * React Query hook - 取得 pinned topics
 */
export function usePinnedTopics() {
  return useTopics('pinned');
}

/**
 * React Query hook - 取得一般 topics（非 pinned）
 */
export function useRegularTopics() {
  return useTopics('regular');
}

/**
 * 從 API 獲取父 topics（包含子 topics）
 */
async function fetchParentTopics(options?: {
  onlyWithTags?: boolean;
  tagId?: string;
}): Promise<ParentTopicWithChildren[]> {
  const params = new URLSearchParams();
  if (options?.onlyWithTags) params.append('withTags', 'true');
  if (options?.tagId) params.append('tagId', options.tagId);

  const url = `/api/topics/parent-topics${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch parent topics');
  }

  const result: ParentTopicsResponse = await response.json();

  // 將日期字串轉換回 Date 物件
  return result.data.map((topic) => ({
    ...topic,
    createdAt: new Date(topic.createdAt),
    updatedAt: new Date(topic.updatedAt),
  }));
}

/**
 * React Query hook - 取得父 topics（parentTopicId 為 null 且有子 topics）
 * @param options - 過濾選項
 * @param options.onlyWithTags - 只返回有 tags 的 topics
 * @param options.tagId - 只返回包含特定 tag 的 topics
 */
export function useParentTopics(options?: {
  onlyWithTags?: boolean;
  tagId?: string;
}) {
  return useQuery({
    queryKey: ['topics', 'parent-topics', options],
    queryFn: () => fetchParentTopics(options),
    staleTime: 5 * 60 * 1000, // 5 分鐘
  });
}

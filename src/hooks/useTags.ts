import { useQuery } from '@tanstack/react-query';
import type { Tag } from '@/types/tag';

interface TagsResponse {
  data: Tag[];
  success: boolean;
}

/**
 * 從 API 獲取 tags 資料
 */
async function fetchTags(): Promise<Tag[]> {
  const response = await fetch('/api/tags');

  if (!response.ok) {
    throw new Error('Failed to fetch tags');
  }

  const result: TagsResponse = await response.json();
  return result.data;
}

/**
 * React Query hook - 取得所有 tags
 */
export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
    staleTime: 5 * 60 * 1000, // 5 分鐘
  });
}

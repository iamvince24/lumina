import { useQuery } from '@tanstack/react-query';
import type { MindMap } from '@/types/mindmap';

interface MindMapResponse {
  data: MindMap | null;
  success?: boolean;
}

/**
 * 將日期格式化為 YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 從 API 獲取指定日期的 MindMap 資料
 */
async function fetchMindMapByDate(date: Date): Promise<MindMap | null> {
  const dateStr = formatDate(date);
  const response = await fetch(`/api/mindmaps/${dateStr}`);

  if (!response.ok) {
    throw new Error('Failed to fetch mindmap');
  }

  const result: MindMapResponse = await response.json();
  return result.data;
}

/**
 * React Query hook - 取得指定日期的 MindMap
 */
export function useMindMapByDate(date: Date) {
  const dateStr = formatDate(date);

  return useQuery({
    queryKey: ['mindmap', dateStr],
    queryFn: () => fetchMindMapByDate(date),
    staleTime: 60 * 1000, // 1 分鐘
  });
}

/**
 * React Query hook - 取得今天的 MindMap
 */
export function useTodayMindMap() {
  return useMindMapByDate(new Date());
}

import { useQuery, keepPreviousData } from '@tanstack/react-query';

interface CalendarEntry {
  date: string;
  hasContent: boolean;
  nodeCount: number;
  topicCount: number;
  preview: string;
}

interface CalendarResponse {
  data: Record<string, CalendarEntry>;
  error?: string;
}

async function fetchCalendarEntries(year: number, month: number) {
  const response = await fetch(`/api/calendar?year=${year}&month=${month}`);

  if (!response.ok) {
    throw new Error('Failed to fetch calendar entries');
  }

  const result: CalendarResponse = await response.json();
  return result.data;
}

export function useCalendarEntries(year: number, month: number) {
  return useQuery({
    queryKey: ['calendar', year, month],
    queryFn: () => fetchCalendarEntries(year, month),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: keepPreviousData, // Keep showing previous month's data while loading new month
  });
}

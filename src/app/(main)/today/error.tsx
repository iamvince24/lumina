/**
 * 今天編輯頁面的 Error UI
 */
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function TodayError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Today Page Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">發生錯誤</h2>
        <p className="text-gray-600 mb-6">
          載入今天的編輯頁面時發生錯誤。請重試或重新整理頁面。
        </p>

        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="default">
            重試
          </Button>
          <Button
            onClick={() => (window.location.href = '/today')}
            variant="outline"
          >
            重新整理
          </Button>
        </div>
      </div>
    </div>
  );
}

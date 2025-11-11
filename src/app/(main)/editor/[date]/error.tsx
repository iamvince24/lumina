/**
 * 編輯器的 Error UI
 */
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function EditorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Editor Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">發生錯誤</h2>
        <p className="text-gray-600 mb-6">
          載入心智圖時發生錯誤。請重試或回到首頁。
        </p>

        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="default">
            重試
          </Button>
          <Button
            onClick={() => (window.location.href = '/today')}
            variant="outline"
          >
            回到首頁
          </Button>
        </div>
      </div>
    </div>
  );
}

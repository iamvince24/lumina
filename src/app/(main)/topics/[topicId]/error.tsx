/**
 * Topic 詳細頁的 Error UI
 */
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function TopicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Topic Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          無法載入 Topic
        </h2>
        <p className="text-gray-600 mb-6">
          載入 Topic 時發生錯誤。請確認 Topic ID 是否正確，或重試。
        </p>

        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="default">
            重試
          </Button>
          <Button
            onClick={() => (window.location.href = '/topics')}
            variant="outline"
          >
            查看所有 Topics
          </Button>
        </div>
      </div>
    </div>
  );
}

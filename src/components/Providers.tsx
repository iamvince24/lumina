'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  // 在客戶端創建 QueryClient 實例，使用 useState 的 lazy initialization 確保只建立一次
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 分鐘內視為新鮮資料
            gcTime: 5 * 60 * 1000, // 5 分鐘後清除未使用的快取（原本叫 cacheTime）
            refetchOnWindowFocus: true, // 切換視窗時重新 fetch（跨 Tab 同步）
            refetchOnReconnect: true, // 網路重連時重新 fetch
            retry: 1, // 失敗重試 1 次
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 開發環境才顯示 DevTools */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};

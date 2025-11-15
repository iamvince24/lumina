# Mock 資料系統使用指南

## 概述

本專案使用了一套完整的 Mock 資料系統，讓前端開發可以在沒有後端 API 的情況下進行。這個系統設計為可以輕鬆替換成真實 API。

## 架構說明

### 1. 配置檔案

**位置**: `src/services/config.ts`

```typescript
// 控制是否使用 Mock 資料
export const USE_MOCK_DATA =
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ||
  process.env.NODE_ENV === 'development';
```

可以透過環境變數控制：
- 開發環境：預設使用 Mock 資料
- 生產環境：使用真實 API

在 `.env.local` 中設定：
```env
NEXT_PUBLIC_USE_MOCK_DATA=true  # 使用 Mock 資料
NEXT_PUBLIC_API_BASE_URL=/api   # API 基礎路徑
```

### 2. Mock 資料

**位置**: `src/__mocks__/`

```
src/__mocks__/
├── data.ts              # Mock 資料集
├── settingsData.ts      # 設定相關假資料
├── hooks.ts             # Mock API Hooks
└── types.ts             # Mock 專用型別
```

#### 主要資料集

- `MOCK_TOPICS`: Topic 假資料
- `MOCK_MINDMAPS`: 心智圖假資料（按日期索引）
- `MOCK_TOPIC_NODES`: Topic 節點假資料
- `MOCK_DELETED_TOPICS`: 已刪除的 Topics
- `MOCK_DELETED_NODES`: 已刪除的 Nodes
- `MOCK_DELETED_MINDMAPS`: 已刪除的 MindMaps
- `MOCK_CALENDAR_ENTRIES`: 月曆資料
- `MOCK_USER_SETTINGS`: 使用者設定

### 3. Mock Hooks

**位置**: `src/__mocks__/hooks.ts`

所有 Mock Hook 都遵循相同的介面模式，方便未來替換：

```typescript
// 查詢型 Hook
interface UseQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch?: () => void;
}

// 變更型 Hook
interface UseMutationResult {
  mutate: (params: any) => Promise<void>;
  isLoading: boolean;
}
```

#### 可用的 Mock Hooks

**Topics 相關**
- `useMockRecentTopics(limit)` - 取得最近的 Topics
- `useMockTopicById(topicId)` - 根據 ID 取得 Topic
- `useMockAllTopics()` - 取得所有 Topics
- `useMockTopicNodes(topicId)` - 取得 Topic 的節點
- `useMockUpdateTopicName()` - 更新 Topic 名稱

**MindMaps 相關**
- `useMockMindMapByDate(date)` - 根據日期取得心智圖
- `useMockUpdateMindMap(options)` - 更新心智圖

**Calendar 相關**
- `useMockGetCalendarEntries({ year, month })` - 取得月曆資料

**Settings 相關**
- `useMockGetUserSettings()` - 取得使用者設定
- `useMockUpdateUserSettings(options)` - 更新使用者設定

**Recently Deleted 相關**
- `useMockGetDeletedTopics()` - 取得已刪除的 Topics
- `useMockGetDeletedNodes()` - 取得已刪除的 Nodes
- `useMockGetDeletedMindMaps()` - 取得已刪除的 MindMaps
- `useMockRestoreTopic(options)` - 復原 Topic
- `useMockPermanentDeleteTopic(options)` - 永久刪除 Topic

**Auth 相關**
- `useMockSignIn(options)` - 登入
- `useMockSignUp(options)` - 註冊
- `useMockSignOut(options)` - 登出

**Tags 相關**
- `useMockCreateTag(options)` - 建立 Tag
- `useMockGetAllTags()` - 取得所有 Tags
- `useMockUpdateNodeTags(options)` - 更新 Node 的 Tags

## 使用方式

### 在組件中使用 Mock Hooks

```typescript
'use client';

import { useMockRecentTopics } from '@/__mocks__/hooks';

export default function MyComponent() {
  // ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
  const { data: topics, isLoading, error } = useMockRecentTopics(10);

  if (isLoading) return <div>載入中...</div>;
  if (error) return <div>錯誤: {error.message}</div>;

  return (
    <div>
      {topics?.map(topic => (
        <div key={topic.id}>{topic.name}</div>
      ))}
    </div>
  );
}
```

### 變更型操作

```typescript
'use client';

import { useMockUpdateTopicName } from '@/__mocks__/hooks';
import { toast } from 'sonner';

export default function EditTopic({ topicId }: { topicId: string }) {
  const updateTopic = useMockUpdateTopicName({
    onSuccess: () => {
      toast.success('Topic 已更新');
    },
    onError: (error) => {
      toast.error('更新失敗: ' + error.message);
    },
  });

  const handleUpdate = () => {
    updateTopic.mutate({ topicId, name: '新名稱' });
  };

  return (
    <button onClick={handleUpdate} disabled={updateTopic.isLoading}>
      {updateTopic.isLoading ? '更新中...' : '更新'}
    </button>
  );
}
```

## 如何串接真實 API

### 方案 1: 使用 tRPC

1. **安裝 tRPC**
```bash
npm install @trpc/server @trpc/client @trpc/react-query @trpc/next
```

2. **建立 tRPC 路由**

在 `src/server/api/routers/` 中建立路由：

```typescript
// src/server/api/routers/topics.ts
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const topicsRouter = createTRPCRouter({
  getRecent: publicProcedure
    .input(z.object({ limit: z.number() }))
    .query(async ({ input, ctx }) => {
      // 從資料庫取得資料
      return await ctx.db.topic.findMany({
        take: input.limit,
        orderBy: { lastUpdated: 'desc' },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.db.topic.findUnique({
        where: { id: input.id },
      });
    }),
});
```

3. **建立真實 API Hooks**

在 `src/hooks/api/` 中建立 hooks：

```typescript
// src/hooks/api/useTopics.ts
import { api } from '@/utils/api';

export function useRecentTopics(limit: number = 10) {
  return api.topics.getRecent.useQuery({ limit });
}

export function useTopicById(topicId: string) {
  return api.topics.getById.useQuery({ id: topicId });
}
```

4. **替換組件中的 Hook**

```typescript
// 之前
import { useMockRecentTopics } from '@/__mocks__/hooks';
const { data, isLoading, error } = useMockRecentTopics(10);

// 替換後
import { useRecentTopics } from '@/hooks/api/useTopics';
const { data, isLoading, error } = useRecentTopics(10);
```

### 方案 2: 使用 REST API

1. **建立 API 客戶端**

```typescript
// src/lib/api-client.ts
import axios from 'axios';
import { API_BASE_URL } from '@/services/config';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

2. **建立 API 服務**

```typescript
// src/services/api/topics.ts
import { apiClient } from '@/lib/api-client';

export const topicsApi = {
  getRecent: async (limit: number) => {
    const { data } = await apiClient.get('/topics/recent', {
      params: { limit },
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get(`/topics/${id}`);
    return data;
  },
};
```

3. **使用 React Query 建立 Hooks**

```typescript
// src/hooks/api/useTopics.ts
import { useQuery } from '@tanstack/react-query';
import { topicsApi } from '@/services/api/topics';

export function useRecentTopics(limit: number = 10) {
  return useQuery({
    queryKey: ['topics', 'recent', limit],
    queryFn: () => topicsApi.getRecent(limit),
  });
}

export function useTopicById(topicId: string) {
  return useQuery({
    queryKey: ['topics', topicId],
    queryFn: () => topicsApi.getById(topicId),
  });
}
```

### 方案 3: 建立抽象層（推薦）

建立一個統一的服務層，可以根據環境變數自動切換：

```typescript
// src/services/topics.service.ts
import { USE_MOCK_DATA } from './config';
import { useMockRecentTopics, useMockTopicById } from '@/__mocks__/hooks';
import { useRecentTopics as useRealRecentTopics, useTopicById as useRealTopicById } from '@/hooks/api/useTopics';

export const useRecentTopics = (limit: number = 10) => {
  return USE_MOCK_DATA
    ? useMockRecentTopics(limit)
    : useRealRecentTopics(limit);
};

export const useTopicById = (topicId: string) => {
  return USE_MOCK_DATA
    ? useMockTopicById(topicId)
    : useRealTopicById(topicId);
};
```

然後在組件中使用：

```typescript
import { useRecentTopics } from '@/services/topics.service';

// 會根據環境變數自動切換 Mock 或真實 API
const { data, isLoading, error } = useRecentTopics(10);
```

## 注意事項

1. **所有使用 Mock Hook 的地方都有標記**
   - 搜尋 `⚠️ 目前使用假資料 Hook` 可以找到所有需要替換的位置

2. **保持介面一致性**
   - Mock Hooks 和真實 API Hooks 應該有相同的介面
   - 這樣替換時不需要修改組件邏輯

3. **錯誤處理**
   - Mock Hooks 也模擬了錯誤情況
   - 確保真實 API 也有相同的錯誤處理

4. **日期處理**
   - Mock 資料使用 JavaScript Date 物件
   - 確保真實 API 也正確處理日期序列化/反序列化

5. **測試**
   - 替換前後都應該進行完整測試
   - 可以使用環境變數在測試環境中切換

## 尋找需要替換的位置

使用以下命令搜尋所有使用 Mock Hooks 的位置：

```bash
# 搜尋所有使用 Mock Hooks 的檔案
grep -r "from '@/__mocks__/hooks'" src/

# 搜尋所有標記的位置
grep -r "⚠️ 目前使用假資料 Hook" src/
```

## 已實作假資料的頁面

- ✅ `/today` - 今天的編輯頁
- ✅ `/editor/[date]` - 特定日期編輯器
- ✅ `/topics` - Topics 列表頁
- ✅ `/topics/[topicId]` - Topic 詳細頁
- ✅ `/calendar` - 月曆視圖
- ✅ `/settings` - 設定頁面
- ✅ `/recently-deleted` - 最近刪除頁面
- ✅ `/auth/login` - 登入頁面
- ✅ `/auth/signup` - 註冊頁面

## 後續步驟

1. 選擇 API 方案（tRPC 或 REST API）
2. 建立後端 API 端點
3. 建立對應的真實 API Hooks
4. 逐頁替換 Mock Hooks 為真實 API Hooks
5. 測試並驗證功能
6. 在生產環境中禁用 Mock 資料

## 資源

- [tRPC 官方文檔](https://trpc.io/)
- [React Query 官方文檔](https://tanstack.com/query/latest)
- [Axios 官方文檔](https://axios-http.com/)

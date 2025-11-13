# Lumina 專案結構改善計劃

> 📅 **更新日期**: 2025-11-12
> 📝 **狀態**: 第一階段已完成

## 目錄

- [改善目標](#改善目標)
- [第一階段：組件結構重組 ✅](#第一階段組件結構重組-)
- [為什麼這些改進是好的](#為什麼這些改進是好的)
- [第二階段：未來改進計劃](#第二階段未來改進計劃)
- [第三階段：進階優化](#第三階段進階優化)
- [實施時間表](#實施時間表)

---

## 改善目標

### 核心目標
1. **提升可維護性**：讓代碼結構更清晰，容易理解和修改
2. **增強可擴展性**：為未來功能添加打下良好基礎
3. **統一開發模式**：減少認知負擔，提高團隊協作效率
4. **遵循最佳實踐**：符合業界標準和 Next.js 生態系統慣例

### 預期效益
- ⏱️ 減少 30% 的功能添加時間
- 🔍 提高 50% 的代碼可讀性
- 🤝 降低新成員上手時間
- 🐛 減少因結構混亂導致的 bug

---

## 第一階段：組件結構重組 ✅

### 已完成的改進

#### 1. 組件目錄化

**改動內容：**
```diff
src/components/
- ├── Header.tsx                          ❌ 單獨的文件
- ├── SaveStatusIndicator.tsx             ❌ 單獨的文件
+ ├── Layout/                              ✅ 目錄化結構
+ │   ├── Header.tsx
+ │   └── index.tsx
+ ├── SaveStatus/                          ✅ 目錄化結構
+ │   ├── SaveStatusIndicator.tsx
+ │   └── index.tsx
```

**影響的文件：**
- ✅ `src/app/(main)/layout.tsx` - 更新 Header 導入
- ✅ `src/components/MindMapEditor/index.tsx` - 更新 SaveStatusIndicator 導入

**為什麼這樣做？**

1. **擴展性提升**
   ```typescript
   // 現在可以輕鬆添加相關組件
   Layout/
   ├── Header.tsx
   ├── Footer.tsx         // 未來添加
   ├── Sidebar.tsx        // 未來添加
   └── index.tsx          // 統一導出

   // 使用時非常清晰
   import { Header, Footer } from '@/components/Layout';
   ```

2. **維護性改善**
   - 相關文件集中在同一目錄
   - 子組件可以直接添加在同一位置
   - 測試文件可以與組件放在一起

3. **一致性保證**
   - 現在所有主要組件都遵循相同的目錄結構
   - 降低新成員的學習曲線

#### 2. 工具函式整合

**改動內容：**
```diff
src/
- ├── lib/
- │   └── utils.ts                        ❌ 單獨的目錄，只有一個文件
  ├── utils/
+ │   ├── cn.ts                            ✅ 明確的命名
  │   ├── export/
  │   ├── dataTransform/
  │   └── layoutAlgorithms/
```

**影響的文件：**
更新了 **23 個文件**的導入路徑：
- ✅ 所有 UI 組件 (`src/components/ui/*.tsx`)
- ✅ 自定義組件 (`Calendar.tsx`, `CustomNode.tsx`, `OutlineItem.tsx`, `TabItem.tsx`)

**為什麼這樣做？**

1. **避免目錄碎片化**
   - 不需要 `lib` 和 `utils` 兩個相似目錄
   - 所有工具函式統一管理

2. **更清晰的語義**
   ```typescript
   // 之前：文件名不明確
   import { cn } from '@/lib/utils';

   // 現在：文件名即功能
   import { cn } from '@/utils/cn';

   // 未來可以添加更多
   import { formatDate } from '@/utils/date';
   import { debounce } from '@/utils/performance';
   ```

3. **更好的 IDE 支援**
   - 輸入 `@/utils/` 時自動列出所有工具模組
   - 不需要打開文件就知道功能

### 改進成果統計

| 項目 | 數量 |
|------|------|
| 新增目錄 | 2 個 |
| 新增 index.tsx | 2 個 |
| 移動的文件 | 3 個 |
| 刪除的文件 | 3 個 |
| 更新的導入 | 23 處 |
| 受益的組件 | 全部主要組件 |

---

## 為什麼這些改進是好的

### 1. 遵循「單一職責原則」

**概念：**
每個目錄負責一個明確的功能領域，相關文件集中管理。

**實際效益：**
```typescript
// 當需要添加 Header 的子功能時
Layout/
├── Header.tsx
├── HeaderLogo.tsx           // 新增：Logo 組件
├── HeaderUserMenu.tsx       // 新增：使用者選單
├── HeaderNotification.tsx   // 新增：通知功能
└── index.tsx                // 統一導出

// 外部使用不受影響
import { Header } from '@/components/Layout';
```

### 2. 封裝實作細節（Encapsulation）

**概念：**
使用 `index.tsx` 作為公開 API，內部實作可以自由重構。

**實際效益：**
```typescript
// Layout/index.tsx
export { Header } from './Header';
export { Footer } from './Footer';

// 重構 Header 時，可以拆分成多個文件
// 但外部使用代碼完全不需要改變
import { Header } from '@/components/Layout';  // 依然有效
```

### 3. 降低認知負擔（Cognitive Load）

**統一的模式：**
```typescript
// 現在所有組件都遵循相同的導入模式
import { Header } from '@/components/Layout';
import { MindMapEditor } from '@/components/MindMapEditor';
import { TabSystem } from '@/components/TabSystem';
import { TagDialog } from '@/components/TagSystem/TagDialog';
import { Calendar } from '@/components/CalendarView';

// 而不是混亂的模式
// import { Header } from '@/components/Header';          ❌ 單文件
// import { MindMapEditor } from '@/components/MindMapEditor';  ✓ 目錄
```

### 4. 支援測試驅動開發（TDD）

**組織測試文件：**
```typescript
Layout/
├── Header.tsx
├── Header.test.tsx          // 單元測試
├── Header.stories.tsx       // Storybook (可選)
└── index.tsx

SaveStatus/
├── SaveStatusIndicator.tsx
├── SaveStatusIndicator.test.tsx
└── index.tsx
```

### 5. 符合業界標準

這種結構被廣泛採用：

- **Next.js**: App Router 使用目錄結構
- **Material-UI**: 每個組件一個目錄
- **Ant Design**: 目錄化組件
- **React 文檔**: 推薦按功能分組

---

## 第二階段：未來改進計劃

### 優先級：高 🔴

#### 1. Mock 數據遷移至真實 API

**當前狀態：**
```typescript
// 許多文件仍使用 mock hooks
import { useMockSignIn, useMockSignOut } from '@/__mocks__/hooks';
import { useMockUpdateNodeTags } from '@/__mocks__/hooks';
```

**改進計劃：**

1. **階段 1：創建 API 層結構**
   ```
   src/lib/api/
   ├── client.ts              // API 客戶端設定
   ├── auth.ts                // 認證 API
   ├── mindmap.ts             // 心智圖 API
   ├── topic.ts               // 主題 API
   ├── tag.ts                 // 標籤 API
   └── types.ts               // API 類型定義
   ```

2. **階段 2：創建真實的 Custom Hooks**
   ```
   src/hooks/api/
   ├── useAuth.ts             // 認證相關 hooks
   ├── useMindMap.ts          // 心智圖操作
   ├── useTopic.ts            // 主題操作
   └── useTag.ts              // 標籤操作
   ```

3. **階段 3：逐步替換 Mock**
   - 使用環境變數控制 mock/real API
   - 保留 mock 用於開發和測試
   ```typescript
   // 開發模式可以切換
   const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
   const useSignIn = USE_MOCK ? useMockSignIn : useRealSignIn;
   ```

**預期效益：**
- 🚀 準備好連接後端
- 🧪 保留 mock 用於測試
- 🔄 平滑的過渡過程

**預估時間：** 2-3 週

---

#### 2. 完善類型系統

**當前狀態：**
```
src/types/
├── mindmap.ts
├── topic.ts
├── view.ts
└── tag.ts
```

**改進計劃：**

1. **添加缺少的類型定義**
   ```typescript
   src/types/
   ├── mindmap.ts
   ├── topic.ts
   ├── view.ts
   ├── tag.ts
   ├── user.ts               // 新增：使用者類型
   ├── api.ts                // 新增：API 請求/回應類型
   ├── component.ts          // 新增：通用組件 Props
   └── index.ts              // 新增：統一導出
   ```

2. **強化類型安全**
   ```typescript
   // 使用更嚴格的類型
   type NodeId = string & { readonly brand: unique symbol };
   type UserId = string & { readonly brand: unique symbol };

   // 避免字串混用導致的錯誤
   ```

3. **添加 API 類型驗證**
   ```typescript
   // 使用 Zod 進行運行時類型驗證
   import { z } from 'zod';

   const MindMapSchema = z.object({
     id: z.string(),
     title: z.string(),
     nodes: z.array(NodeSchema),
     edges: z.array(EdgeSchema),
   });
   ```

**預期效益：**
- 🛡️ 減少 TypeScript 錯誤
- 🔍 更好的 IDE 自動完成
- 🐛 在編譯時捕獲更多錯誤

**預估時間：** 1 週

---

### 優先級：中 🟡

#### 3. 增強 Custom Hooks

**當前狀態：**
```
src/hooks/
├── useAutoSave.ts
├── useKeyboardShortcuts.ts
├── useLayoutWorker.ts
└── useTab.ts
```

**改進計劃：**

1. **添加通用 Hooks**
   ```
   src/hooks/
   ├── common/
   │   ├── useLocalStorage.ts    // localStorage 管理
   │   ├── useDebounce.ts        // 防抖
   │   ├── useThrottle.ts        // 節流
   │   ├── useAsync.ts           // 非同步操作
   │   ├── useMediaQuery.ts      // 響應式設計
   │   └── index.ts
   ├── api/                       // API 相關 hooks
   │   ├── useAuth.ts
   │   ├── useMindMap.ts
   │   └── index.ts
   ├── useAutoSave.ts
   ├── useKeyboardShortcuts.ts
   ├── useLayoutWorker.ts
   └── useTab.ts
   ```

2. **優化現有 Hooks**
   ```typescript
   // 添加更好的錯誤處理
   // 添加 loading 狀態
   // 添加取消機制
   ```

**預期效益：**
- 🔄 減少重複代碼
- 📦 可重用的邏輯
- 🧪 更容易測試

**預估時間：** 1-2 週

---

#### 4. 優化 Store 結構

**當前狀態：**
```
src/stores/
├── authStore.ts
├── mindmapStore.ts
├── saveStatusStore.ts
├── tabStore.ts
├── tagStore.ts
├── topicStore.ts
└── viewModeStore.ts
```

**改進計劃：**

1. **添加 Store 工具函式**
   ```
   src/stores/
   ├── utils/
   │   ├── createPersistedStore.ts    // 持久化工具
   │   ├── createAsyncStore.ts        // 非同步 store 工具
   │   └── middleware.ts              // 自定義中間件
   ├── authStore.ts
   ├── mindmapStore.ts
   └── ...
   ```

2. **標準化 Store 模式**
   ```typescript
   // 統一的 store 結構
   interface StoreState<T> {
     data: T | null;
     loading: boolean;
     error: Error | null;
   }

   interface StoreActions {
     fetch: () => Promise<void>;
     update: (data: Partial<T>) => void;
     reset: () => void;
   }
   ```

3. **添加 Store 測試**
   ```
   src/stores/
   ├── __tests__/
   │   ├── authStore.test.ts
   │   ├── mindmapStore.test.ts
   │   └── ...
   ```

**預期效益：**
- 🎯 統一的狀態管理模式
- 🔄 更容易的狀態同步
- 🧪 更好的測試覆蓋

**預估時間：** 1 週

---

### 優先級：低 🟢

#### 5. 完善測試覆蓋

**當前狀態：**
```
src/__tests__/
├── unit/
│   ├── components/         (3 個測試)
│   ├── stores/             (3 個測試)
│   └── utils/              (3 個測試)
├── integration/            (1 個測試)
└── setup.ts
```

**改進計劃：**

1. **增加測試覆蓋率目標**
   - Unit Tests: 80%+
   - Integration Tests: 60%+
   - E2E Tests: 關鍵流程 100%

2. **添加測試工具**
   ```
   src/__tests__/
   ├── helpers/
   │   ├── mockData.ts        // 測試數據工廠
   │   ├── renderWithProviders.ts
   │   └── testUtils.ts
   ├── unit/
   ├── integration/
   ├── e2e/                   // 新增 E2E 測試
   └── setup.ts
   ```

3. **添加 CI/CD 測試流程**
   ```yaml
   # .github/workflows/test.yml
   - Run unit tests
   - Run integration tests
   - Generate coverage report
   - Fail if coverage < 80%
   ```

**預期效益：**
- 🛡️ 更高的代碼品質
- 🐛 更早發現 bug
- 🔄 更安心的重構

**預估時間：** 持續進行

---

#### 6. 文檔化

**改進計劃：**

1. **組件文檔**
   ```
   docs/
   ├── components/
   │   ├── Layout.md
   │   ├── MindMapEditor.md
   │   └── ...
   ├── hooks/
   │   ├── useAutoSave.md
   │   └── ...
   ├── stores/
   │   ├── mindmapStore.md
   │   └── ...
   └── api/
       └── README.md
   ```

2. **添加 Storybook**
   ```bash
   npm install --save-dev @storybook/react
   ```
   ```
   src/components/
   ├── Layout/
   │   ├── Header.tsx
   │   ├── Header.stories.tsx    // Storybook 故事
   │   └── index.tsx
   ```

3. **API 文檔**
   - 使用 JSDoc 註解
   - 生成 TypeDoc 文檔

**預期效益：**
- 📚 新成員更快上手
- 🤝 更好的團隊協作
- 📖 可視化的組件庫

**預估時間：** 2-3 週

---

## 第三階段：進階優化

### 1. 性能優化

- **Code Splitting**: 按路由分割代碼
- **Dynamic Imports**: 延遲載入組件
- **Web Worker**: 移動重計算到 Worker (已部分實現)
- **Virtual Scrolling**: 優化長列表 (已部分實現)

### 2. 開發體驗優化

- **ESLint Rules**: 自定義規則
- **Prettier 配置**: 統一代碼風格
- **Pre-commit Hooks**: 自動檢查 (已實現)
- **VS Code 設定**: 統一開發環境 (已實現)

### 3. 部署優化

- **Docker 容器化**
- **CI/CD Pipeline**
- **環境變數管理**
- **錯誤追蹤** (Sentry 等)

---

## 實施時間表

### 近期 (1-2 週)
- ✅ 組件結構重組 (已完成)
- 🔄 Mock 數據遷移規劃
- 🔄 類型系統完善

### 中期 (1-2 個月)
- 📋 API 層實作
- 📋 Custom Hooks 擴充
- 📋 Store 優化
- 📋 測試覆蓋提升

### 長期 (2-3 個月)
- 📋 文檔化
- 📋 性能優化
- 📋 部署優化

---

## 如何參與

### 開發者指南

1. **遵循新的結構**
   - 新增組件時使用目錄結構
   - 創建 `index.tsx` 作為導出點
   - 相關文件放在同一目錄

2. **代碼審查檢查清單**
   - [ ] 是否遵循目錄結構？
   - [ ] 是否有 TypeScript 類型？
   - [ ] 是否有單元測試？
   - [ ] 是否更新了文檔？

3. **提交規範**
   ```
   feat: 添加新功能
   fix: 修復 bug
   refactor: 重構代碼
   docs: 文檔更新
   test: 測試相關
   chore: 構建/工具相關
   ```

---

## 結論

這個改善計劃旨在：

1. ✅ **已完成**：建立清晰的組件結構基礎
2. 🎯 **進行中**：準備過渡到真實 API
3. 🚀 **未來**：持續優化和完善

通過這些改進，Lumina 專案將更加：
- 🏗️ **可維護** - 清晰的結構和模式
- 🚀 **可擴展** - 容易添加新功能
- 🤝 **協作友好** - 統一的開發規範
- 🛡️ **穩定可靠** - 完善的測試和類型

---

## 參考資源

- [Next.js Project Structure Best Practices](https://nextjs.org/docs/app/building-your-application/routing/colocation)
- [React File Structure](https://react.dev/learn/thinking-in-react#step-1-break-the-ui-into-a-component-hierarchy)
- [Clean Code by Robert C. Martin](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)
- [Atomic Design Pattern](https://bradfrost.com/blog/post/atomic-web-design/)

---

**最後更新**: 2025-11-12
**維護者**: Claude AI Assistant
**專案**: Lumina - 心智圖應用

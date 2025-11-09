# Lumina 前端專案

Lumina 是一個基於 Next.js 14+ 的心智圖應用程式，使用 TypeScript、shadcn/ui、Zustand、React Flow 等技術建構。

## 📋 專案技術棧

- **框架**: Next.js 14+ (App Router)
- **語言**: TypeScript
- **套件管理**: pnpm
- **UI 框架**: shadcn/ui
- **狀態管理**: Zustand
- **心智圖引擎**: React Flow
- **資料視覺化**: D3.js
- **動畫**: Framer Motion
- **虛擬滾動**: @tanstack/react-virtual
- **測試框架**: Vitest + React Testing Library

## 🚀 開始使用

### 安裝依賴

```bash
pnpm install
```

### 開發模式

```bash
pnpm dev
```

開啟 [http://localhost:3000](http://localhost:3000) 查看結果。

### 執行測試

```bash
# 執行所有測試
pnpm test

# 執行測試並顯示 UI
pnpm test:ui

# 檢查測試覆蓋率
pnpm test:coverage

# 監聽模式
pnpm test:watch
```

### 建置專案

```bash
pnpm build
```

### 執行 Lint

```bash
pnpm lint
```

## 📁 專案結構

```
src/
├── app/                          # Next.js App Router
├── components/                   # React 組件
│   ├── ui/                       # shadcn/ui 組件
│   ├── MindMapEditor/            # 心智圖編輯器
│   ├── TopicSystem/              # Topic 相關組件
│   └── CalendarView/             # 月曆視圖組件
├── stores/                       # Zustand stores
├── types/                        # TypeScript 型別定義
├── utils/                        # 工具函式
├── hooks/                        # Custom Hooks
└── __tests__/                    # 測試檔案
```

## 📝 開發規範

- 所有程式碼必須有繁體中文註解
- 使用 TypeScript 嚴格模式
- 遵循 ESLint 和 Prettier 規範
- 每個功能模組必須有單元測試（覆蓋率 > 80%）

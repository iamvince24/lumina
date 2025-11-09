/**
 * 主應用 Layout
 * 包含側邊欄和 Header
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* TODO: 側邊欄組件 */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-4">
          <h2 className="text-lg font-semibold">Lumina</h2>
        </div>
      </aside>

      {/* 主內容區域 */}
      <div className="flex-1 flex flex-col">
        {/* TODO: Header 和 Tab 系統 */}
        <header className="h-14 bg-white border-b border-gray-200">
          <div className="h-full px-4 flex items-center">
            <span className="text-sm text-gray-600">Header Placeholder</span>
          </div>
        </header>

        {/* 頁面內容 */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

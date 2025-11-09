/**
 * 認證 Layout
 * 簡化版 Layout，無側邊欄
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

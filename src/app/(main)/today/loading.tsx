/**
 * 今天編輯頁面的 Loading UI
 */
export default function TodayLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">載入中...</p>
      </div>
    </div>
  );
}

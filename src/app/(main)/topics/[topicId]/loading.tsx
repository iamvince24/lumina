/**
 * Topic 詳細頁的 Loading UI
 * 使用 Skeleton 載入效果
 */
export default function TopicLoading() {
  return (
    <div className="container mx-auto py-8">
      {/* Header Skeleton */}
      <div className="animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
      </div>

      {/* Content Skeleton */}
      <div className="mt-8 animate-pulse">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

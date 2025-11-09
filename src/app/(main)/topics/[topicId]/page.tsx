/**
 * Topic 詳細頁
 */
interface TopicDetailPageProps {
  params: {
    topicId: string;
  };
}

export default function TopicDetailPage({ params }: TopicDetailPageProps) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Topic: {params.topicId}</h1>
      <p className="text-gray-600 mt-2">這裡將顯示 Topic 的詳細資訊</p>
    </div>
  );
}

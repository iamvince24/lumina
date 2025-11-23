'use client';

import { useState, useEffect } from 'react';
import { Tag } from '@/types/tag';
import { getTagsAction } from '@/app/actions/tagActions';
import { Plus, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TagDialog } from '@/components/TagSystem/TagDialog';
import { createTagAction } from '@/app/actions/tagActions';
import { useParentTopics } from '@/hooks/useTopics';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const router = useRouter();

  const { data: topics = [], isLoading: isTopicsLoading } = useParentTopics({
    onlyWithTags: true,
    tagId: selectedTagId || undefined,
  });

  const loadTags = async () => {
    setIsLoading(true);
    const result = await getTagsAction();
    if (result.success && result.data) {
      setTags(result.data);
    } else {
      console.error('Failed to load tags:', result.error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    void (async () => {
      setIsLoading(true);
      const result = await getTagsAction();
      if (result.success && result.data) {
        setTags(result.data);
      } else {
        console.error('Failed to load tags:', result.error);
      }
      setIsLoading(false);
    })();
  }, []);

  const handleDialogSubmit = async (data: { name: string; color: string }) => {
    const result = await createTagAction(data);
    if (result.success) {
      loadTags();
    } else {
      alert('建立失敗');
      throw new Error(result.error);
    }
  };

  const handleTagClick = (tagId: string) => {
    setSelectedTagId(selectedTagId === tagId ? null : tagId);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days} 天前`;
    return date.toLocaleDateString('zh-TW');
  };

  if (isLoading || isTopicsLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-gray-600">載入中...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-white">
      <div className="max-w-[1200px] mx-auto p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-normal text-gray-900">所有標籤</h1>
            <Button
              onClick={() => setDialogOpen(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              新增標籤
            </Button>
          </div>
        </div>

        {/* Tags as filter chips */}
        <div className="mb-8">
          {tags.length === 0 ? (
            <div className="text-center py-8 text-gray-500">還沒有任何標籤</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleTagClick(tag.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedTagId === tag.id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Hash className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm">{tag.name}</span>
                  <span className="text-xs text-gray-400">
                    {tag.usageCount}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Topics List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {selectedTagId ? '已篩選的主題' : '所有主題'}
            </h2>
            <span className="text-sm text-gray-500">
              {topics.length} 個主題
            </span>
          </div>

          {topics.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500">沒有找到符合的主題</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((topic) => (
                <Card
                  key={topic.id}
                  className="p-5 cursor-pointer hover:shadow-md transition-all border-gray-100 hover:border-gray-200"
                  onClick={() => router.push(`/topics/${topic.id}`)}
                >
                  <h3 className="font-medium text-lg text-gray-900 mb-2">
                    {topic.name}
                  </h3>
                  <div className="text-sm text-gray-500 mb-3">
                    {topic.accumulationCount} 個節點
                  </div>

                  {/* Tags */}
                  {topic.tags && topic.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {topic.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-0.5 text-xs bg-gray-50 text-gray-600 rounded-md"
                          style={{ borderLeft: `3px solid ${tag.color}` }}
                        >
                          {tag.name}
                        </span>
                      ))}
                      {topic.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-xs bg-gray-50 text-gray-500 rounded-md">
                          +{topic.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-gray-400 pt-3 border-t border-gray-50">
                    {formatRelativeTime(topic.updatedAt)}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Tag Dialog */}
        <TagDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleDialogSubmit}
        />
      </div>
    </div>
  );
}

/**
 * Topic 卡片視圖容器
 * 支援 List 和 Grid 兩種顯示模式
 */

import { useState, useMemo } from 'react';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMindMapStore } from '@/stores/mindmapStore';
import { TopicCard } from './TopicCard';
import type { Node } from '@/types/mindmap';

interface TopicCardViewProps {
  /** Topic ID */
  topicId: string;
}

/**
 * Topic 卡片視圖組件
 */
export const TopicCardView = ({ topicId }: TopicCardViewProps) => {
  // 顯示模式狀態
  const [mode, setMode] = useState<'list' | 'grid'>('grid');

  // 從 Store 取得資料
  const { nodes, edges } = useMindMapStore();

  /**
   * 取得第一層子 Nodes
   * （從 Topic Node 出發，往下一層）
   */
  const firstLevelChildren = useMemo(() => {
    // 找到 Topic Node
    const topicNode = nodes.find((n) => n.data.topicId === topicId);
    if (!topicNode) return [];

    // 找到直接子節點
    const childIds = edges
      .filter((e) => e.source === topicNode.id)
      .map((e) => e.target);

    return nodes.filter((n) => childIds.includes(n.id));
  }, [nodes, edges, topicId]);

  /**
   * 處理卡片點擊
   */
  const handleCardClick = (node: Node) => {
    // TODO: 開啟 Node 詳細頁或聚焦到該 Node
    console.log('Card clicked:', node);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">卡片視圖</h2>
          <p className="text-sm text-gray-500 mt-1">
            顯示 {firstLevelChildren.length} 個第一層節點
          </p>
        </div>

        {/* 顯示模式切換 */}
        <div className="flex gap-2">
          <Button
            variant={mode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('list')}
          >
            <LayoutList className="w-4 h-4 mr-2" />
            List
          </Button>
          <Button
            variant={mode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('grid')}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Grid
          </Button>
        </div>
      </div>

      {/* 卡片容器 */}
      <div className="flex-1 overflow-y-auto p-6">
        {firstLevelChildren.length === 0 ? (
          // 空狀態
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg mb-2">尚無內容</p>
            <p className="text-sm">開始新增節點來建立知識結構</p>
          </div>
        ) : (
          // 卡片列表
          <div
            className={
              mode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-4'
            }
          >
            {firstLevelChildren.map((node) => (
              <TopicCard
                key={node.id}
                node={node}
                mode={mode}
                onClick={() => handleCardClick(node)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

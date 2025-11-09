/**
 * Topic 卡片組件
 * 顯示第一層子 Node 的資訊
 */

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useMindMapStore } from '@/stores/mindmapStore';
import type { Node } from '@/types/mindmap';

interface TopicCardProps {
  /** 子 Node */
  node: Node;

  /** 顯示模式 */
  mode: 'list' | 'grid';

  /** 點擊卡片的回調 */
  onClick?: () => void;
}

/**
 * Topic 卡片組件
 */
export const TopicCard = ({ node, mode, onClick }: TopicCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 從 MindMapStore 取得 edges 來計算子節點數量
  const { edges, nodes } = useMindMapStore();

  /**
   * 計算子節點數量
   */
  const childCount = useMemo(() => {
    return edges.filter((e) => e.source === node.id).length;
  }, [edges, node.id]);

  /**
   * 取得子節點列表
   */
  const childNodes = useMemo(() => {
    const childIds = edges
      .filter((e) => e.source === node.id)
      .map((e) => e.target);

    return nodes.filter((n) => childIds.includes(n.id));
  }, [edges, nodes, node.id]);

  /**
   * 處理展開/收合按鈕點擊
   */
  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <Card
      className={`
        cursor-pointer transition-all hover:shadow-lg
        ${mode === 'grid' ? 'h-full' : ''}
      `}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="truncate">{node.data.label}</span>

          {/* 子節點數量 */}
          {childCount > 0 && (
            <span className="text-xs font-normal text-gray-500">
              {childCount} nodes
            </span>
          )}
        </CardTitle>
      </CardHeader>

      {mode === 'list' && (
        <CardContent>
          {/* List 模式：顯示預覽文字 */}
          <p className="text-sm text-gray-600 line-clamp-3">
            {node.data.label}
          </p>

          {/* 展開/收合按鈕 */}
          {childCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full"
              onClick={handleExpandClick}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  收合
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  展開
                </>
              )}
            </Button>
          )}

          {/* 展開的內容 */}
          {isExpanded && childCount > 0 && (
            <div className="mt-3 pl-4 border-l-2 border-gray-200">
              {childNodes.length > 0 ? (
                <ul className="space-y-2">
                  {childNodes.map((childNode) => (
                    <li key={childNode.id} className="text-sm text-gray-500">
                      • {childNode.data.label}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">子節點列表...</p>
              )}
            </div>
          )}
        </CardContent>
      )}

      {mode === 'grid' && (
        <CardContent>
          {/* Grid 模式：只顯示簡要資訊 */}
          <div className="text-sm text-gray-500">
            {childCount > 0 ? `${childCount} 個子節點` : '無子節點'}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

/**
 * Topic Node Component
 * 主題節點組件 - MindMeister 風格
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { NodeData } from '@/types/mindmap';
import { Badge } from '@/components/ui/badge';

/**
 * 主題節點組件
 * 黑色背景，中等尺寸，用於思維導圖的分支主題
 */
export const TopicNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <div className="relative">
      {/* 左側連接點 (target) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
      />

      {/* 右側連接點 (source) - 用於子節點 */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
      />

      {/* 節點內容 */}
      <div
        className={`
          px-6 py-3 rounded-lg
          bg-gray-900 text-white text-base
          shadow-md
          transition-all duration-200
          whitespace-pre-wrap break-words
          min-w-[100px] max-w-[250px]
          ${selected ? 'ring-4 ring-gray-400 ring-opacity-50 shadow-lg scale-105' : ''}
        `}
        style={{
          boxShadow: selected
            ? '0 4px 16px rgba(0, 0, 0, 0.3)'
            : '0 2px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div>{data.label || '新主題'}</div>

        {/* 標籤顯示 */}
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {data.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-xs px-2 py-0.5"
                style={{
                  backgroundColor: tag.color || '#6b7280',
                  color: 'white',
                }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

TopicNode.displayName = 'TopicNode';

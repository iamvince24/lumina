/**
 * Center Node Component
 * 中心節點組件 - MindMeister 風格
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { NodeData } from '@/types/mindmap';

/**
 * 中心節點組件
 * 藍色漸變背景，較大尺寸，用於思維導圖的中心主題
 */
export const CenterNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <div className="relative">
      {/* 右側連接點 (source) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
      />

      {/* 節點內容 */}
      <div
        className={`
          px-8 py-4 rounded-xl
          bg-gradient-to-br from-blue-500 to-blue-900
          text-white text-lg font-semibold
          shadow-lg
          transition-all duration-200
          whitespace-pre-wrap break-words
          min-w-[120px] max-w-[300px]
          ${selected ? 'ring-4 ring-blue-300 ring-opacity-50 shadow-xl scale-105' : ''}
        `}
        style={{
          boxShadow: selected
            ? '0 8px 24px rgba(65, 105, 225, 0.4)'
            : '0 4px 12px rgba(65, 105, 225, 0.3)',
        }}
      >
        {data.label || '中心主題'}
      </div>
    </div>
  );
});

CenterNode.displayName = 'CenterNode';

/**
 * 自訂 Node 組件
 * 用於 React Flow 的 Radial 視圖
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import type { NodeData } from '@/types/mindmap';

/**
 * 自訂 Node 組件
 * 顯示 Node 的內容，支援編輯和互動
 */
export const CustomNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <div
      className={cn(
        'px-4 py-2 rounded-lg border-2 bg-white shadow-md transition-all',
        'min-w-[120px] max-w-[300px]',
        selected ? 'border-blue-500 shadow-lg' : 'border-gray-300',
        data.isTopic && 'bg-blue-50 border-blue-400 font-semibold'
      )}
      style={{
        backgroundColor: data.color || undefined,
      }}
    >
      {/* 連接點：上方 */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500!"
      />

      {/* Node 內容 */}
      <div className="text-sm text-gray-800 wrap-break-word">{data.label}</div>

      {/* 連接點：下方 */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500!"
      />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

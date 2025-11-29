/**
 * MindMeister-Style Node Component
 * Clean, professional pill-shaped node with MindMeister aesthetic
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { cn } from '@/utils';
import { Badge } from '@/components/ui/badge';
import type { NodeData } from '@/types/mindmap';

/**
 * Get background color based on node depth/level
 * Root: white, depth 1: soft blue, depth 2: soft green, etc.
 */
function getDepthColor(depth: number): string {
  const colors = [
    '#ffffff', // Root - white
    '#dbeafe', // Depth 1 - soft blue
    '#dcfce7', // Depth 2 - soft green
    '#fef3c7', // Depth 3 - soft yellow
    '#fce7f3', // Depth 4 - soft pink
    '#e0e7ff', // Depth 5 - soft indigo
  ];
  return colors[Math.min(depth, colors.length - 1)];
}

/**
 * MindMeister Node Component
 * Features:
 * - Pill-shaped design (rounded-full or rounded-lg)
 * - Clean white background with soft pastels based on depth
 * - Subtle shadow by default
 * - Clear accent border when selected
 * - Invisible but functional handles
 */
export const MindMeisterNode = memo(
  ({ data, selected }: NodeProps<NodeData>) => {
    // Estimate depth from data if available (we'll set this in the view)
    const depth = data.depth || 0;
    const backgroundColor = data.color || getDepthColor(depth);

    return (
      <div className="relative">
        {/* Left Handle (target) - invisible but functional */}
        <Handle
          type="target"
          position={Position.Left}
          className="!opacity-0 !bg-transparent !border-0"
          style={{ left: -4 }}
        />

        {/* Right Handle (source) - invisible but functional */}
        <Handle
          type="source"
          position={Position.Right}
          className="!opacity-0 !bg-transparent !border-0"
          style={{ right: -4 }}
        />

        {/* Node Content */}
        <div
          className={cn(
            'px-6 py-3 rounded-lg',
            'bg-white shadow-sm',
            'transition-all duration-200',
            'min-w-[100px] max-w-[280px]',
            'flex items-center justify-center',
            // Selected state - clear accent border
            selected && 'ring-2 ring-blue-400 shadow-md'
          )}
          style={{
            backgroundColor,
          }}
        >
          {/* Label */}
          <div className="text-sm text-gray-800 font-normal text-center whitespace-pre-wrap break-words">
            {data.label}
          </div>
        </div>

        {/* Tags (below the node) */}
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 justify-center">
            {data.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-xs px-1.5 py-0.5"
                style={{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color,
                  borderColor: tag.color,
                }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }
);

MindMeisterNode.displayName = 'MindMeisterNode';

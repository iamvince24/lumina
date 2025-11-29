import { useState, useCallback, useRef } from 'react';
import type { Point } from '../types';

interface UseNodeDragOptions {
  onDragStart?: (nodeId: string) => void;
  onDrag?: (nodeId: string, position: Point) => void;
  onDragEnd?: (nodeId: string, position: Point) => void;
  viewport: { x: number; y: number; zoom: number };
}

interface UseNodeDragReturn {
  isDragging: boolean;
  draggedNodeId: string | null;
  handleDragStart: (nodeId: string, event: React.MouseEvent) => void;
}

export function useNodeDrag(options: UseNodeDragOptions): UseNodeDragReturn {
  const { onDragStart, onDrag, onDragEnd, viewport } = options;

  const [isDragging, setIsDragging] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // 使用 ref 避免在 event handler 中閉包陷阱
  const dragStateRef = useRef({
    startMousePos: { x: 0, y: 0 },
    startNodePos: { x: 0, y: 0 },
  });

  const handleDragStart = useCallback(
    (nodeId: string, event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      // 記錄起始位置
      dragStateRef.current = {
        startMousePos: { x: event.clientX, y: event.clientY },
        startNodePos: { x: 0, y: 0 }, // 會在 onDragStart 中更新
      };

      setIsDragging(true);
      setDraggedNodeId(nodeId);
      onDragStart?.(nodeId);

      // 添加全域事件監聽
      const handleMouseMove = (e: MouseEvent) => {
        const dx =
          (e.clientX - dragStateRef.current.startMousePos.x) / viewport.zoom;
        const dy =
          (e.clientY - dragStateRef.current.startMousePos.y) / viewport.zoom;

        const newPosition = {
          x: dragStateRef.current.startNodePos.x + dx,
          y: dragStateRef.current.startNodePos.y + dy,
        };

        onDrag?.(nodeId, newPosition);
      };

      const handleMouseUp = (e: MouseEvent) => {
        const dx =
          (e.clientX - dragStateRef.current.startMousePos.x) / viewport.zoom;
        const dy =
          (e.clientY - dragStateRef.current.startMousePos.y) / viewport.zoom;

        const finalPosition = {
          x: dragStateRef.current.startNodePos.x + dx,
          y: dragStateRef.current.startNodePos.y + dy,
        };

        setIsDragging(false);
        setDraggedNodeId(null);
        onDragEnd?.(nodeId, finalPosition);

        // 移除事件監聽
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [viewport.zoom, onDragStart, onDrag, onDragEnd]
  );

  return {
    isDragging,
    draggedNodeId,
    handleDragStart,
  };
}

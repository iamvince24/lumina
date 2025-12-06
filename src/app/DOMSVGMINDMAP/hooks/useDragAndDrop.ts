import { useState, useCallback, useRef, useEffect } from 'react';
import { Position, DragState } from '../types';

interface UseDragAndDropProps {
  onDragStart?: (nodeId: string, position: Position) => void;
  onDrag?: (nodeId: string, position: Position) => void;
  onDragEnd?: (nodeId: string, position: Position) => void;
}

export const useDragAndDrop = ({
  onDragStart,
  onDrag,
  onDragEnd,
}: UseDragAndDropProps = {}) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    nodeId: null,
    startPosition: null,
    offset: null,
  });

  const dragStateRef = useRef(dragState);

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  const handleMouseDown = useCallback(
    (nodeId: string, event: React.MouseEvent, nodePosition: Position) => {
      event.stopPropagation();

      const startPos = {
        x: event.clientX,
        y: event.clientY,
      };

      const offset = {
        x: event.clientX - nodePosition.x,
        y: event.clientY - nodePosition.y,
      };

      setDragState({
        isDragging: true,
        nodeId,
        startPosition: startPos,
        offset,
      });

      onDragStart?.(nodeId, nodePosition);
    },
    [onDragStart]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const state = dragStateRef.current;

      if (!state.isDragging || !state.nodeId || !state.offset) return;

      const newPosition = {
        x: event.clientX - state.offset.x,
        y: event.clientY - state.offset.y,
      };

      onDrag?.(state.nodeId, newPosition);
    },
    [onDrag]
  );

  const handleMouseUp = useCallback(
    (event: MouseEvent) => {
      const state = dragStateRef.current;

      if (!state.isDragging || !state.nodeId || !state.offset) return;

      const finalPosition = {
        x: event.clientX - state.offset.x,
        y: event.clientY - state.offset.y,
      };

      onDragEnd?.(state.nodeId, finalPosition);

      setDragState({
        isDragging: false,
        nodeId: null,
        startPosition: null,
        offset: null,
      });
    },
    [onDragEnd]
  );

  useEffect(() => {
    if (dragState.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  return {
    dragState,
    handleMouseDown,
  };
};

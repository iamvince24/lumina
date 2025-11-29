import { useState, useCallback, useRef } from 'react';
import type { Viewport } from '../types';

interface UseCanvasPanOptions {
  viewport: Viewport;
  onViewportChange: (viewport: Viewport) => void;
}

interface UseCanvasPanReturn {
  isPanning: boolean;
  handlePanStart: (event: React.MouseEvent) => void;
}

export function useCanvasPan(options: UseCanvasPanOptions): UseCanvasPanReturn {
  const { viewport, onViewportChange } = options;

  const [isPanning, setIsPanning] = useState(false);

  const panStateRef = useRef({
    startMousePos: { x: 0, y: 0 },
    startViewport: { x: 0, y: 0 },
  });

  const handlePanStart = useCallback(
    (event: React.MouseEvent) => {
      // 只有點擊空白處才開始平移
      const target = event.target as HTMLElement;
      if (
        target.tagName !== 'svg' &&
        !target.classList.contains('viewport-transform')
      ) {
        return;
      }

      event.preventDefault();

      panStateRef.current = {
        startMousePos: { x: event.clientX, y: event.clientY },
        startViewport: { x: viewport.x, y: viewport.y },
      };

      setIsPanning(true);

      const handleMouseMove = (e: MouseEvent) => {
        const dx = e.clientX - panStateRef.current.startMousePos.x;
        const dy = e.clientY - panStateRef.current.startMousePos.y;

        onViewportChange({
          ...viewport,
          x: panStateRef.current.startViewport.x + dx,
          y: panStateRef.current.startViewport.y + dy,
        });
      };

      const handleMouseUp = () => {
        setIsPanning(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [viewport, onViewportChange]
  );

  return {
    isPanning,
    handlePanStart,
  };
}

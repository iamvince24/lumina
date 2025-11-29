import {
  forwardRef,
  useCallback,
  type ReactNode,
  type WheelEvent,
} from 'react';
import type { Viewport } from '@/lib/mindmap/types';

interface SVGCanvasProps {
  width: number;
  height: number;
  viewport: Viewport;
  onViewportChange: (viewport: Viewport) => void;
  children: ReactNode;
}

export const SVGCanvas = forwardRef<SVGSVGElement, SVGCanvasProps>(
  ({ width, height, viewport, onViewportChange, children }, ref) => {
    // 處理滾輪縮放
    const handleWheel = useCallback(
      (e: WheelEvent<SVGSVGElement>) => {
        // 需要 Cmd/Ctrl 才能縮放
        if (!e.metaKey && !e.ctrlKey) return;

        e.preventDefault();

        const rect = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // 計算新的縮放比例
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.1, Math.min(3, viewport.zoom * delta));

        // 以滑鼠位置為中心縮放
        const scale = newZoom / viewport.zoom;
        const newX = mouseX - (mouseX - viewport.x) * scale;
        const newY = mouseY - (mouseY - viewport.y) * scale;

        onViewportChange({
          x: newX,
          y: newY,
          zoom: newZoom,
        });
      },
      [viewport, onViewportChange]
    );

    return (
      <svg
        ref={ref}
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 mindmap-canvas"
        onWheel={handleWheel}
      >
        {/* 定義 SVG 濾鏡和漸層 */}
        <defs>
          {/* 節點陰影 */}
          <filter id="node-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="4"
              floodColor="#000000"
              floodOpacity="0.1"
            />
          </filter>

          {/* 節點 hover 陰影 */}
          <filter
            id="node-shadow-hover"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="8"
              floodColor="#000000"
              floodOpacity="0.15"
            />
          </filter>

          {/* 連線漸層 */}
          <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* 可縮放平移的內容群組 */}
        <g
          className="viewport-transform"
          transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}
        >
          {children}
        </g>
      </svg>
    );
  }
);

SVGCanvas.displayName = 'SVGCanvas';

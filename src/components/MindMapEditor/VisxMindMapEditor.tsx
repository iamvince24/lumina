'use client';

import { useCallback, useMemo, useRef } from 'react';
import { Zoom } from '@visx/zoom';
import { useMindMapStore } from '@/lib/stores/mindmapStore';
import { MindMapTree } from './MindMapTree';
import { ZoomControls } from './ZoomControls';
import { ZOOM_LIMITS, NODE_DEFAULTS } from '@/lib/mindmap/constants';
import { useKeyboardShortcuts } from '@/lib/mindmap/hooks/useKeyboardShortcuts';

interface VisxMindMapEditorProps {
  width: number;
  height: number;
}

export function VisxMindMapEditor({ width, height }: VisxMindMapEditorProps) {
  // Store
  const { nodes, viewMode, selectedNodeIds, editingNodeId, setSelectedNodes } =
    useMindMapStore();

  // Keyboard shortcuts
  useKeyboardShortcuts();

  // Ghost Node ref for drop indicator (direct DOM manipulation for performance)
  const ghostNodeRef = useRef<SVGGElement | null>(null);

  // Handle canvas click
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent) => {
      const target = event.target as Element;
      if (
        target.tagName.toLowerCase() === 'svg' ||
        target.classList.contains('zoom-background')
      ) {
        setSelectedNodes([]);
      }
    },
    [setSelectedNodes]
  );

  // Initial zoom transform
  const initialTransform = useMemo(
    () => ({
      scaleX: 1,
      scaleY: 1,
      translateX: width / 2,
      translateY: height / 2,
      skewX: 0,
      skewY: 0,
    }),
    [width, height]
  );

  return (
    <div className="relative w-full h-full bg-gray-50">
      {/* visx Zoom container */}
      <Zoom<SVGSVGElement>
        width={width}
        height={height}
        scaleXMin={ZOOM_LIMITS.MIN}
        scaleXMax={ZOOM_LIMITS.MAX}
        scaleYMin={ZOOM_LIMITS.MIN}
        scaleYMax={ZOOM_LIMITS.MAX}
        initialTransformMatrix={initialTransform}
        wheelDelta={(event) => {
          // Cmd/Ctrl + wheel to zoom
          if (event.metaKey || event.ctrlKey) {
            const scale = -event.deltaY > 0 ? 1.1 : 0.9;
            return { scaleX: scale, scaleY: scale };
          }
          return { scaleX: 1, scaleY: 1 };
        }}
      >
        {(zoom) => (
          <div className="relative">
            <svg
              width={width}
              height={height}
              style={{
                cursor: zoom.isDragging ? 'grabbing' : 'grab',
                touchAction: 'none',
              }}
              onClick={handleCanvasClick}
            >
              {/* SVG definitions */}
              <defs>
                <filter
                  id="node-shadow"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feDropShadow
                    dx="0"
                    dy="2"
                    stdDeviation="3"
                    floodColor="#000000"
                    floodOpacity="0.08"
                  />
                </filter>
                <filter
                  id="node-shadow-selected"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feDropShadow
                    dx="0"
                    dy="2"
                    stdDeviation="4"
                    floodColor="#3B82F6"
                    floodOpacity="0.3"
                  />
                </filter>
              </defs>

              {/* Background (receives zoom/pan events) */}
              <rect
                className="zoom-background"
                width={width}
                height={height}
                fill="transparent"
                onTouchStart={zoom.dragStart}
                onTouchMove={zoom.dragMove}
                onTouchEnd={zoom.dragEnd}
                onMouseDown={(event) => {
                  // Only start dragging if clicking on canvas
                  if (event.target === event.currentTarget) {
                    zoom.dragStart(event);
                  }
                }}
                onMouseMove={zoom.dragMove}
                onMouseUp={zoom.dragEnd}
                onMouseLeave={() => {
                  if (zoom.isDragging) zoom.dragEnd();
                }}
                onWheel={(event) => {
                  if (event.metaKey || event.ctrlKey) {
                    zoom.handleWheel(event);
                  }
                }}
              />

              {/* Zoomable/pannable content group */}
              <g transform={zoom.toString()}>
                <MindMapTree
                  nodes={nodes}
                  viewMode={viewMode}
                  selectedNodeIds={selectedNodeIds}
                  editingNodeId={editingNodeId}
                  zoom={zoom.transformMatrix.scaleX}
                  ghostNodeRef={ghostNodeRef}
                />
                {/* Ghost Node (Drop Indicator) - Direct DOM manipulation for 60fps */}
                <g
                  ref={ghostNodeRef}
                  id="ghost-indicator"
                  opacity="0"
                  style={{ pointerEvents: 'none' }}
                >
                  <rect
                    width={NODE_DEFAULTS.WIDTH}
                    height={NODE_DEFAULTS.HEIGHT}
                    rx="4"
                    ry="4"
                    fill="#E5E7EB"
                    stroke="#9CA3AF"
                    strokeWidth="1"
                    opacity="0.8"
                  />
                </g>
              </g>
            </svg>

            {/* Zoom controls */}
            <ZoomControls
              className="absolute bottom-4 right-4"
              zoom={zoom.transformMatrix.scaleX}
              onZoomIn={() => zoom.scale({ scaleX: 1.2, scaleY: 1.2 })}
              onZoomOut={() => zoom.scale({ scaleX: 0.8, scaleY: 0.8 })}
              onReset={zoom.reset}
            />
          </div>
        )}
      </Zoom>
    </div>
  );
}

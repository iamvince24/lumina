'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { D3MindMapData } from '@/types/d3-mindmap';
import { D3Graph } from './D3Graph';
import { Toolbar } from './Toolbar';

interface MindMapContainerProps {
  initialData: D3MindMapData;
}

/**
 * Container component managing state and layout for the Mind Map
 * Handles window resizing, zoom state, and component orchestration
 */
export function MindMapContainer({ initialData }: MindMapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform | null>(
    null
  );
  const [layout, setLayout] = useState<'horizontal' | 'radial'>('radial');
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Handle window resize
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    // Initial measurement
    updateDimensions();

    // Setup ResizeObserver
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>();
    svg.transition().duration(300).call(zoom.scaleBy, 1.2);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>();
    svg.transition().duration(300).call(zoom.scaleBy, 0.8);
  }, []);

  const handleResetView = useCallback(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>();
    svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
  }, []);

  const handleZoomChange = useCallback((transform: d3.ZoomTransform) => {
    setZoomTransform(transform);
  }, []);

  const handleLayoutChange = useCallback(
    (newLayout: 'horizontal' | 'radial') => {
      setLayout(newLayout);
    },
    []
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[600px] bg-gray-50"
    >
      {/* Title Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">
          D3.js Mind Map Editor
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Drag nodes to reposition • Cmd/Ctrl + Scroll to zoom • Drag canvas to
          pan • Switch between Radial & Horizontal layouts
        </p>
      </div>

      {/* Main Canvas Area */}
      <div className="absolute inset-0 pt-20 p-6 flex items-center justify-center">
        <D3Graph
          ref={svgRef}
          data={initialData}
          width={dimensions.width - 48}
          height={dimensions.height - 104}
          onZoomChange={handleZoomChange}
          layout={layout}
        />
      </div>

      {/* Toolbar Controls */}
      <Toolbar
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        currentZoom={zoomTransform?.k ?? 1}
        layout={layout}
        onLayoutChange={handleLayoutChange}
      />
    </div>
  );
}

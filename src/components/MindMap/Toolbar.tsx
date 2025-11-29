'use client';

import { ZoomIn, ZoomOut, Maximize2, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  currentZoom: number;
  layout?: 'horizontal' | 'radial';
  onLayoutChange?: (layout: 'horizontal' | 'radial') => void;
}

/**
 * Toolbar component for mind map controls
 * Provides zoom, view reset, and layout switching functionality
 */
export function Toolbar({
  onZoomIn,
  onZoomOut,
  onResetView,
  currentZoom,
  layout = 'radial',
  onLayoutChange,
}: ToolbarProps) {
  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white rounded-lg shadow-md border border-gray-200 p-2">
      {/* Zoom In */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomIn}
        title="Zoom In (Cmd/Ctrl + Scroll)"
        className="hover:bg-gray-100"
      >
        <ZoomIn className="h-5 w-5" />
      </Button>

      {/* Current Zoom Level */}
      <div className="px-2 py-1 text-xs text-center text-gray-600 font-medium">
        {Math.round(currentZoom * 100)}%
      </div>

      {/* Zoom Out */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomOut}
        title="Zoom Out (Cmd/Ctrl + Scroll)"
        className="hover:bg-gray-100"
      >
        <ZoomOut className="h-5 w-5" />
      </Button>

      {/* Divider */}
      <div className="h-px bg-gray-200 my-1" />

      {/* Reset View */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onResetView}
        title="Reset View"
        className="hover:bg-gray-100"
      >
        <Maximize2 className="h-5 w-5" />
      </Button>

      {/* Layout Switcher */}
      {onLayoutChange && (
        <>
          <div className="h-px bg-gray-200 my-1" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              onLayoutChange(layout === 'radial' ? 'horizontal' : 'radial')
            }
            title={`Switch to ${layout === 'radial' ? 'Horizontal' : 'Radial'} Layout`}
            className="hover:bg-gray-100"
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <div className="px-2 py-1 text-xs text-center text-gray-600 font-medium">
            {layout === 'radial' ? 'Radial' : 'H-Tree'}
          </div>
        </>
      )}
    </div>
  );
}

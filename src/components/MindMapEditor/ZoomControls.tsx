import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ZoomControlsProps {
  className?: string;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function ZoomControls({
  className = '',
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
}: ZoomControlsProps) {
  return (
    <div
      className={`flex flex-col gap-2 bg-white rounded-lg shadow-md p-2 ${className}`}
    >
      <Button size="icon" variant="ghost" onClick={onZoomIn} title="Zoom In">
        <ZoomIn className="w-4 h-4" />
      </Button>

      <div className="text-xs text-center text-gray-600 px-2">
        {Math.round(zoom * 100)}%
      </div>

      <Button size="icon" variant="ghost" onClick={onZoomOut} title="Zoom Out">
        <ZoomOut className="w-4 h-4" />
      </Button>

      <div className="border-t my-1" />

      <Button size="icon" variant="ghost" onClick={onReset} title="Reset Zoom">
        <Maximize2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

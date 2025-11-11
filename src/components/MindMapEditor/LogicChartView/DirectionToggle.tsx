/**
 * 方向切換組件
 */

'use client';

import { ArrowDown, ArrowRight } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { LayoutDirection } from '@/types/view';

interface DirectionToggleProps {
  /** 當前方向 */
  direction: LayoutDirection;

  /** 方向變更回調 */
  onChange: (direction: LayoutDirection) => void;
}

/**
 * 方向切換組件
 */
export function DirectionToggle({ direction, onChange }: DirectionToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
      <span className="text-sm text-gray-600 px-2">佈局方向</span>

      <ToggleGroup
        type="single"
        value={direction}
        onValueChange={(value) => {
          if (value) onChange(value as LayoutDirection);
        }}
      >
        <ToggleGroupItem value="TB" aria-label="垂直佈局" variant="outline">
          <ArrowDown className="w-4 h-4 mr-1" />
          垂直
        </ToggleGroupItem>
        <ToggleGroupItem value="LR" aria-label="水平佈局" variant="outline">
          <ArrowRight className="w-4 h-4 mr-1" />
          水平
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

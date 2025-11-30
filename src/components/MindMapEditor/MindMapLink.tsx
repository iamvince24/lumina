import { memo, useState, useMemo } from 'react';
import { LinkHorizontal, LinkRadialStep } from '@visx/shape';
import type { HierarchyLink } from 'd3-hierarchy';
import type { MindMapNodeData, ViewMode } from '@/lib/mindmap/types';
import { NODE_DEFAULTS } from '@/lib/mindmap/constants';

interface MindMapLinkProps {
  link: HierarchyLink<MindMapNodeData>;
  viewMode: ViewMode;
  color: string;
}

export const MindMapLink = memo<MindMapLinkProps>(
  ({ link, viewMode, color }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Calculate connection path start and end points
    // visx Tree coordinates: x is vertical direction, y is horizontal direction
    // We need to swap x and y, considering node width
    const sourceX = useMemo(() => {
      if (viewMode === 'horizontal') {
        return (link.source.y ?? 0) + NODE_DEFAULTS.WIDTH / 2;
      }
      return link.source.x ?? 0;
    }, [link.source, viewMode]);

    const sourceY = useMemo(() => {
      if (viewMode === 'horizontal') {
        return link.source.x ?? 0;
      }
      return (link.source.y ?? 0) + NODE_DEFAULTS.HEIGHT / 2;
    }, [link.source, viewMode]);

    const targetX = useMemo(() => {
      if (viewMode === 'horizontal') {
        return (link.target.y ?? 0) - NODE_DEFAULTS.WIDTH / 2;
      }
      return link.target.x ?? 0;
    }, [link.target, viewMode]);

    const targetY = useMemo(() => {
      if (viewMode === 'horizontal') {
        return link.target.x ?? 0;
      }
      return (link.target.y ?? 0) - NODE_DEFAULTS.HEIGHT / 2;
    }, [link.target, viewMode]);

    const strokeWidth = isHovered ? 3 : 2;
    const opacity = isHovered ? 1 : 0.7;

    // Choose link type based on view mode
    if (viewMode === 'radial') {
      return (
        <LinkRadialStep
          data={link}
          percent={0.5}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeOpacity={opacity}
          fill="none"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            transition: 'stroke-width 0.15s ease, stroke-opacity 0.15s ease',
          }}
        />
      );
    }

    // Horizontal tree uses LinkHorizontal
    return (
      <g
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Transparent wide click area */}
        <LinkHorizontal
          data={{
            source: { x: sourceY, y: sourceX },
            target: { x: targetY, y: targetX },
          }}
          stroke="transparent"
          strokeWidth={12}
          fill="none"
          style={{ cursor: 'pointer' }}
        />

        {/* Actual connection line */}
        <LinkHorizontal
          data={{
            source: { x: sourceY, y: sourceX },
            target: { x: targetY, y: targetX },
          }}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeOpacity={opacity}
          strokeLinecap="round"
          fill="none"
          style={{
            transition: 'stroke-width 0.15s ease, stroke-opacity 0.15s ease',
            pointerEvents: 'none',
          }}
        />
      </g>
    );
  }
);

MindMapLink.displayName = 'MindMapLink';

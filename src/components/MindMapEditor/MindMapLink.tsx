import { memo, useState, useMemo } from 'react';
import { linkHorizontal, linkRadial } from 'd3-shape';
import type { HierarchyLink } from 'd3-hierarchy';
import type { MindMapNodeData, ViewMode } from '@/lib/mindmap/types';
import { NODE_DEFAULTS, ANIMATION } from '@/lib/mindmap/constants';
import { MotionPath } from './MotionComponents';

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

    // Generate path string based on view mode
    const pathData = useMemo(() => {
      if (viewMode === 'radial') {
        // Use D3 linkRadial for radial connections
        const radialLink = linkRadial<
          {
            source: { x: number; y: number };
            target: { x: number; y: number };
          },
          { x: number; y: number }
        >()
          .angle((d: { x: number; y: number }) => d.x)
          .radius((d: { x: number; y: number }) => d.y);

        return radialLink({
          source: { x: link.source.x ?? 0, y: link.source.y ?? 0 },
          target: { x: link.target.x ?? 0, y: link.target.y ?? 0 },
        });
      } else {
        // Use D3 linkHorizontal for horizontal connections
        const horizontalLink = linkHorizontal<
          {
            source: { x: number; y: number };
            target: { x: number; y: number };
          },
          { x: number; y: number }
        >()
          .x((d: { x: number; y: number }) => d.y)
          .y((d: { x: number; y: number }) => d.x);

        return horizontalLink({
          source: { x: sourceY, y: sourceX },
          target: { x: targetY, y: targetX },
        });
      }
    }, [
      viewMode,
      sourceX,
      sourceY,
      targetX,
      targetY,
      link.source,
      link.target,
    ]);

    // Animation variants
    const pathVariants = {
      initial: {
        pathLength: 0,
        opacity: 0,
      },
      animate: {
        pathLength: 1,
        opacity: opacity,
        transition: {
          pathLength: {
            type: 'spring',
            stiffness: 100,
            damping: 20,
            duration: ANIMATION.DURATION_NORMAL / 1000,
          },
          opacity: {
            duration: ANIMATION.DURATION_FAST / 1000,
          },
        },
      },
      exit: {
        pathLength: 0,
        opacity: 0,
        transition: {
          duration: ANIMATION.DURATION_FAST / 1000,
        },
      },
    };

    // Choose link type based on view mode
    if (!pathData) return null;

    if (viewMode === 'radial') {
      return (
        <g
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <MotionPath
            d={pathData || ''}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pathVariants}
            transition={{
              d: {
                type: 'spring',
                stiffness: 200,
                damping: 25,
                duration: ANIMATION.DURATION_NORMAL / 1000,
              },
              strokeWidth: {
                duration: ANIMATION.DURATION_FAST / 1000,
              },
            }}
            style={{ cursor: 'pointer' }}
          />
        </g>
      );
    }

    // Horizontal tree uses custom path
    return (
      <g
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Transparent wide click area */}
        <MotionPath
          d={pathData || ''}
          stroke="transparent"
          strokeWidth={12}
          fill="none"
          style={{ cursor: 'pointer' }}
          animate={{ d: pathData || '' }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 25,
            duration: ANIMATION.DURATION_NORMAL / 1000,
          }}
        />

        {/* Actual connection line */}
        <MotionPath
          d={pathData || ''}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pathVariants}
          transition={{
            d: {
              type: 'spring',
              stiffness: 200,
              damping: 25,
              duration: ANIMATION.DURATION_NORMAL / 1000,
            },
            strokeWidth: {
              duration: ANIMATION.DURATION_FAST / 1000,
            },
          }}
          style={{ pointerEvents: 'none' }}
        />
      </g>
    );
  }
);

MindMapLink.displayName = 'MindMapLink';

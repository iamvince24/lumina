'use client';

import React from 'react';
import { DropTarget, MindMapNode } from '../types';

interface DropIndicatorProps {
  dropTarget: DropTarget | null;
  nodes: Map<string, MindMapNode>;
  draggingNodeId?: string | null;
}

// Refined spacing constants
const INDICATOR_HEIGHT = 6;
const INDICATOR_GAP = 8;

export const DropIndicator: React.FC<DropIndicatorProps> = ({
  dropTarget,
  nodes,
  draggingNodeId,
}) => {
  const animationKey = dropTarget
    ? `${dropTarget.nodeId}-${dropTarget.type}-${dropTarget.siblingIndex ?? 'edge'}-${dropTarget.parentId ?? 'root'}`
    : 'none';

  if (!dropTarget) return null;

  const targetNode = nodes.get(dropTarget.nodeId);
  const draggingNode = draggingNodeId ? nodes.get(draggingNodeId) : null;
  if (!targetNode) return null;

  // For "child" type: elegant expanding aura effect
  if (dropTarget.type === 'child') {
    return (
      <div key={animationKey} className="absolute pointer-events-none">
        {/* Outer expanding ring */}
        <div
          className="absolute"
          style={{
            left: `${targetNode.position.x - 12}px`,
            top: `${targetNode.position.y - 12}px`,
            width: `${targetNode.size.width + 24}px`,
            height: `${targetNode.size.height + 24}px`,
            borderRadius: '16px',
            background: 'rgba(156, 163, 175, 0.08)',
            animation:
              'dropAuraExpand 0.3s ease-out, dropAuraPulse 2s ease-in-out infinite 0.3s',
          }}
        />

        {/* Inner glow border */}
        <div
          className="absolute"
          style={{
            left: `${targetNode.position.x - 4}px`,
            top: `${targetNode.position.y - 4}px`,
            width: `${targetNode.size.width + 8}px`,
            height: `${targetNode.size.height + 8}px`,
            borderRadius: '12px',
            border: '2px solid transparent',
            background: 'rgba(156, 163, 175, 0.1)',
            backgroundClip: 'padding-box',
            boxShadow: `
              inset 0 0 0 2px rgba(107, 114, 128, 0.4),
              0 0 20px rgba(107, 114, 128, 0.15),
              0 0 40px rgba(156, 163, 175, 0.08)
            `,
            animation: 'dropBorderFadeIn 0.2s ease-out',
          }}
        />

        {/* Floating "+" indicator */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: `${targetNode.position.x + targetNode.size.width + 8}px`,
            top: `${targetNode.position.y + targetNode.size.height / 2 - 12}px`,
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
            boxShadow: '0 2px 8px rgba(107, 114, 128, 0.3)',
            animation:
              'dropIconBounce 0.4s ease-out, dropIconFloat 2s ease-in-out infinite 0.4s',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 1V11M1 6H11"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    );
  }

  // For sibling insertion: fluid morphing indicator
  const isAfter = dropTarget.type === 'sibling-after';
  const indicatorY = isAfter
    ? targetNode.position.y + targetNode.size.height + INDICATOR_GAP
    : targetNode.position.y - INDICATOR_HEIGHT - INDICATOR_GAP;

  // Get width based on dragging node or target node
  const indicatorWidth = draggingNode?.size.width || targetNode.size.width;

  // Determine if dropping at edge position (first or last sibling)
  const parentNode = dropTarget.parentId
    ? nodes.get(dropTarget.parentId)
    : null;
  const siblingCount = parentNode?.children.length ?? 0;
  const isAtFirstPosition =
    dropTarget.type === 'sibling-before' && dropTarget.siblingIndex === 0;
  const isAtLastPosition =
    dropTarget.type === 'sibling-after' &&
    dropTarget.siblingIndex === siblingCount;
  const isEdgePosition = isAtFirstPosition || isAtLastPosition;

  return (
    <div key={animationKey} className="absolute pointer-events-none">
      {/* Main insertion line with gradient */}
      <div
        className="absolute"
        style={{
          left: `${targetNode.position.x}px`,
          top: `${indicatorY}px`,
          width: `${indicatorWidth}px`,
          height: `${INDICATOR_HEIGHT}px`,
          borderRadius: '100px',
          background:
            'linear-gradient(90deg, rgba(107, 114, 128, 0.5) 0%, rgba(156, 163, 175, 0.6) 50%, rgba(107, 114, 128, 0.5) 100%)',
          backgroundSize: '200% 100%',
          animation:
            'dropLineExpand 0.25s ease-out, dropLineShimmer 2s linear infinite 0.25s',
          boxShadow: `
            0 0 12px rgba(107, 114, 128, 0.3),
            0 0 4px rgba(156, 163, 175, 0.2)
          `,
        }}
      />

      {/* Edge markers */}
      <div
        className="absolute"
        style={{
          left: `${targetNode.position.x - 4}px`,
          top: `${indicatorY + INDICATOR_HEIGHT / 2 - 4}px`,
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
          boxShadow: '0 0 8px rgba(107, 114, 128, 0.4)',
          animation:
            'dropDotPop 0.3s ease-out, dropDotPulse 1.5s ease-in-out infinite 0.3s',
        }}
      />
      <div
        className="absolute"
        style={{
          left: `${targetNode.position.x + indicatorWidth - 4}px`,
          top: `${indicatorY + INDICATOR_HEIGHT / 2 - 4}px`,
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
          boxShadow: '0 0 8px rgba(156, 163, 175, 0.4)',
          animation:
            'dropDotPop 0.3s ease-out 0.05s, dropDotPulse 1.5s ease-in-out infinite 0.8s',
        }}
      />

      {/* Ghost preview of node placement - only show at first/last position */}
      {draggingNode && isEdgePosition && (
        <div
          className="absolute"
          style={{
            left: `${targetNode.position.x}px`,
            top: `${
              isAfter
                ? targetNode.position.y +
                  targetNode.size.height +
                  INDICATOR_GAP * 2 +
                  INDICATOR_HEIGHT
                : targetNode.position.y -
                  draggingNode.size.height -
                  INDICATOR_GAP * 2 -
                  INDICATOR_HEIGHT
            }px`,
            width: `${draggingNode.size.width}px`,
            height: `${draggingNode.size.height}px`,
            borderRadius: '8px',
            border: '2px dashed rgba(107, 114, 128, 0.3)',
            background: 'rgba(156, 163, 175, 0.05)',
            animation:
              'dropGhostFadeIn 0.3s ease-out, dropGhostBreath 3s ease-in-out infinite 0.3s',
          }}
        >
          {/* Ghost content hint */}
          <div
            className="absolute inset-2 flex items-center justify-center"
            style={{
              borderRadius: '4px',
              background:
                'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(107, 114, 128, 0.03) 4px, rgba(107, 114, 128, 0.03) 8px)',
            }}
          />
        </div>
      )}
    </div>
  );
};

// CSS Keyframes - inject into document
if (typeof document !== 'undefined') {
  const styleId = 'drop-indicator-animations';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes dropAuraExpand {
        from {
          transform: scale(0.9);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes dropAuraPulse {
        0%, 100% {
          transform: scale(1);
          opacity: 0.8;
        }
        50% {
          transform: scale(1.02);
          opacity: 1;
        }
      }

      @keyframes dropBorderFadeIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes dropIconBounce {
        0% {
          transform: scale(0) rotate(-180deg);
          opacity: 0;
        }
        60% {
          transform: scale(1.2) rotate(10deg);
        }
        100% {
          transform: scale(1) rotate(0deg);
          opacity: 1;
        }
      }

      @keyframes dropIconFloat {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-3px);
        }
      }

      @keyframes dropLineExpand {
        from {
          transform: scaleX(0);
          opacity: 0;
        }
        to {
          transform: scaleX(1);
          opacity: 1;
        }
      }

      @keyframes dropLineShimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      @keyframes dropDotPop {
        0% {
          transform: scale(0);
        }
        60% {
          transform: scale(1.4);
        }
        100% {
          transform: scale(1);
        }
      }

      @keyframes dropDotPulse {
        0%, 100% {
          transform: scale(1);
          opacity: 0.8;
        }
        50% {
          transform: scale(1.2);
          opacity: 1;
        }
      }

      @keyframes dropGhostFadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes dropGhostBreath {
        0%, 100% {
          opacity: 0.6;
        }
        50% {
          opacity: 0.8;
        }
      }

      @keyframes dropArrowBounce {
        0% {
          transform: scale(0) translateY(10px);
          opacity: 0;
        }
        60% {
          transform: scale(1.2) translateY(-2px);
        }
        100% {
          transform: scale(1) translateY(0);
          opacity: 1;
        }
      }

      @keyframes dropArrowFloat {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-4px);
        }
      }
    `;
    document.head.appendChild(style);
  }
}

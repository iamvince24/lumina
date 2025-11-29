'use client';

import { useEffect, useRef, forwardRef } from 'react';
import * as d3 from 'd3';
import type { D3MindMapData, D3MindMapNode } from '@/types/d3-mindmap';

interface D3GraphProps {
  data: D3MindMapData;
  width: number;
  height: number;
  onZoomChange?: (transform: d3.ZoomTransform) => void;
  layout?: 'horizontal' | 'radial';
}

interface HierarchyNode extends d3.HierarchyNode<D3MindMapNode> {
  x: number;
  y: number;
}

type MindMapNodeWithChildren = D3MindMapNode & {
  children?: MindMapNodeWithChildren[];
};

/**
 * Core D3.js rendering component for Mind Map
 * Uses d3.tree() and d3.hierarchy() for hierarchical tree layout
 */
export const D3Graph = forwardRef<SVGSVGElement, D3GraphProps>(function D3Graph(
  { data, width, height, onZoomChange, layout = 'radial' },
  ref
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

    // Clear previous content (important for React Strict Mode)
    g.selectAll('*').remove();

    // Build hierarchy from flat node data
    const rootNode = data.nodes.find((n) => n.parentId === null);
    if (!rootNode) {
      console.error('No root node found');
      return;
    }

    // Convert flat structure to nested hierarchy
    const buildHierarchy = (node: D3MindMapNode): MindMapNodeWithChildren => {
      const children = data.nodes
        .filter((n) => n.parentId === node.id)
        .map(buildHierarchy);
      return {
        ...node,
        children: children.length > 0 ? children : undefined,
      };
    };

    const hierarchyData = buildHierarchy(rootNode);

    // Create hierarchy
    const root = d3.hierarchy(hierarchyData) as HierarchyNode;

    // Configure tree layout based on layout type
    let treeLayout: d3.TreeLayout<D3MindMapNode>;

    if (layout === 'radial') {
      // Radial layout
      const radius = Math.min(width, height) / 2 - 100;
      treeLayout = d3.tree<D3MindMapNode>().size([2 * Math.PI, radius]);

      // Apply layout
      treeLayout(root);

      // Convert polar to cartesian for radial layout
      root.each((node: HierarchyNode) => {
        const angle = node.x;
        const radius = node.y;
        node.x = radius * Math.cos(angle - Math.PI / 2) + width / 2;
        node.y = radius * Math.sin(angle - Math.PI / 2) + height / 2;
      });
    } else {
      // Horizontal layout (tree grows from left to right)
      treeLayout = d3.tree<D3MindMapNode>().size([height - 100, width - 200]);

      // Apply layout
      treeLayout(root);

      // Adjust positions to center and swap x/y for horizontal layout
      root.each((node: HierarchyNode) => {
        const temp = node.x;
        node.x = node.y + 100;
        node.y = temp + 50;
      });
    }

    // Create links (parent-child connections)
    const links = root.links();

    // Draw links with curved paths
    const linkGroup = g.append('g').attr('class', 'links');

    linkGroup
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', (d: d3.HierarchyLink<D3MindMapNode>) => {
        if (layout === 'radial') {
          // Radial curved links
          return `M ${(d.source as HierarchyNode).x} ${(d.source as HierarchyNode).y}
                  Q ${((d.source as HierarchyNode).x + (d.target as HierarchyNode).x) / 2} ${((d.source as HierarchyNode).y + (d.target as HierarchyNode).y) / 2}
                  ${(d.target as HierarchyNode).x} ${(d.target as HierarchyNode).y}`;
        } else {
          // Horizontal curved links (Bezier curve)
          const controlX =
            ((d.source as HierarchyNode).x + (d.target as HierarchyNode).x) / 2;
          return `M ${(d.source as HierarchyNode).x} ${(d.source as HierarchyNode).y}
                  C ${controlX} ${(d.source as HierarchyNode).y},
                    ${controlX} ${(d.target as HierarchyNode).y},
                    ${(d.target as HierarchyNode).x} ${(d.target as HierarchyNode).y}`;
        }
      })
      .attr('fill', 'none')
      .attr(
        'stroke',
        (d: d3.HierarchyLink<D3MindMapNode>) => d.target.data.color || '#94A3B8'
      )
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6);

    // Create node groups
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const nodes = nodeGroup
      .selectAll('g')
      .data(root.descendants())
      .join('g')
      .attr('class', 'node')
      .attr('transform', (d: HierarchyNode) => `translate(${d.x},${d.y})`)
      .attr('cursor', 'pointer')
      .call(
        d3
          .drag<SVGGElement, HierarchyNode>()
          .on('start', function (event, d) {
            d3.select(this).raise();
          })
          .on('drag', function (event, d) {
            d.x = event.x;
            d.y = event.y;
            d3.select(this).attr('transform', `translate(${d.x},${d.y})`);

            // Update connected links
            linkGroup
              .selectAll<
                SVGPathElement,
                d3.HierarchyLink<D3MindMapNode>
              >('path')
              .attr('d', (linkData) => {
                if (layout === 'radial') {
                  return `M ${(linkData.source as HierarchyNode).x} ${(linkData.source as HierarchyNode).y}
                        Q ${((linkData.source as HierarchyNode).x + (linkData.target as HierarchyNode).x) / 2} ${
                          ((linkData.source as HierarchyNode).y +
                            (linkData.target as HierarchyNode).y) /
                          2
                        }
                        ${(linkData.target as HierarchyNode).x} ${(linkData.target as HierarchyNode).y}`;
                } else {
                  const controlX =
                    ((linkData.source as HierarchyNode).x +
                      (linkData.target as HierarchyNode).x) /
                    2;
                  return `M ${(linkData.source as HierarchyNode).x} ${(linkData.source as HierarchyNode).y}
                        C ${controlX} ${(linkData.source as HierarchyNode).y},
                          ${controlX} ${(linkData.target as HierarchyNode).y},
                          ${(linkData.target as HierarchyNode).x} ${(linkData.target as HierarchyNode).y}`;
                }
              });
          }) as unknown as (
          selection: d3.Selection<
            SVGGElement | d3.BaseType,
            HierarchyNode,
            SVGGElement,
            unknown
          >
        ) => void
      );

    // Add rectangles to nodes
    nodes
      .append('rect')
      .attr('width', (d: HierarchyNode) => {
        const baseWidth = 120;
        const charWidth = 8;
        return Math.max(baseWidth, d.data.label.length * charWidth + 40);
      })
      .attr('height', 40)
      .attr('x', (d: HierarchyNode) => {
        const nodeWidth = Math.max(120, d.data.label.length * 8 + 40);
        return -nodeWidth / 2;
      })
      .attr('y', -20)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', (d: HierarchyNode) => d.data.color || '#FFFFFF')
      .attr('stroke', (d: HierarchyNode) =>
        d.depth === 0 ? '#3B82F6' : '#E5E7EB'
      )
      .attr('stroke-width', (d: HierarchyNode) => (d.depth === 0 ? 3 : 2))
      .attr('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))')
      .on('mouseenter', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('filter', 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))');
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))');
      });

    // Add text labels to nodes
    nodes
      .append('text')
      .text((d: HierarchyNode) => d.data.label)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#111827')
      .attr('font-size', (d: HierarchyNode) =>
        d.depth === 0 ? '16px' : '14px'
      )
      .attr('font-weight', (d: HierarchyNode) =>
        d.depth === 0 ? '600' : '500'
      )
      .attr('pointer-events', 'none')
      .style('user-select', 'none');

    // Setup zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        onZoomChange?.(event.transform);
      });

    svg.call(zoom);

    // Cleanup
    return () => {
      g.selectAll('*').remove();
    };
  }, [data, width, height, onZoomChange, layout]);

  return (
    <svg
      ref={(node) => {
        svgRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      width={width}
      height={height}
      className="border border-gray-200 rounded-lg bg-white"
    >
      <g ref={gRef} />
    </svg>
  );
});

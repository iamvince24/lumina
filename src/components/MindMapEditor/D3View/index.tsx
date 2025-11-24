/**
 * D3View 組件
 * 使用 D3.js + SVG 實作心智圖編輯器
 */

'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { Plus } from 'lucide-react';
import { useMindMapStore } from '@/stores/mindmapStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { calculateHorizontalMindMapLayout } from '@/utils/layoutAlgorithms/horizontalMindMap';
import type { Node, Edge } from '@/types/mindmap';

/**
 * 節點尺寸常數
 */
const NODE_WIDTH = 150;
const NODE_HEIGHT = 50;

/**
 * D3View 組件
 */
export function D3View() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 從 Store 取得資料和操作函式
  const {
    nodes: storeNodes,
    edges: storeEdges,
    selectedNodeIds,
    updateNode,
    updateNodes,
    setSelectedNodes,
    addNode,
  } = useMindMapStore();

  // 取得第一個選中的節點 ID（用於快捷鍵）
  const selectedNodeId = useMemo(
    () => selectedNodeIds[0] || undefined,
    [selectedNodeIds]
  );

  // 整合快捷鍵系統
  useKeyboardShortcuts({
    enabled: true,
    selectedNodeId,
    currentView: 'radial',
  });

  /**
   * 計算連線路徑
   */
  const calculateEdgePath = useCallback(
    (edge: Edge): string => {
      const sourceNode = storeNodes.find((n) => n.id === edge.source);
      const targetNode = storeNodes.find((n) => n.id === edge.target);

      if (!sourceNode || !targetNode) return '';

      // 計算起點和終點（節點中心）
      const sourceX = sourceNode.position.x + NODE_WIDTH / 2;
      const sourceY = sourceNode.position.y + NODE_HEIGHT / 2;
      const targetX = targetNode.position.x + NODE_WIDTH / 2;
      const targetY = targetNode.position.y + NODE_HEIGHT / 2;

      // 使用二次貝茲曲線（quadratic curve）
      const controlX = (sourceX + targetX) / 2;
      const controlY = sourceY; // 控制點在起點的水平線上

      return `M ${sourceX} ${sourceY} Q ${controlX} ${controlY} ${targetX} ${targetY}`;
    },
    [storeNodes]
  );

  /**
   * 渲染節點和連線
   */
  const renderGraph = useCallback(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = svg.select('.graph-container');

    // 清除現有內容
    container.selectAll('*').remove();

    // 渲染連線
    const edgesLayer = container
      .append('g')
      .attr('class', 'edges-layer')
      .lower(); // 確保連線在節點下方

    const edgeSelection = edgesLayer
      .selectAll<SVGPathElement, Edge>('.edge')
      .data(storeEdges, (d) => d.id);

    const edgeEnter = edgeSelection
      .enter()
      .append('path')
      .attr('class', 'edge')
      .attr('fill', 'none')
      .attr('stroke', '#E5E7EB')
      .attr('stroke-width', 2);

    edgeEnter
      .merge(
        edgeSelection as d3.Selection<
          SVGPathElement,
          Edge,
          SVGGElement,
          unknown
        >
      )
      .attr('d', calculateEdgePath);

    edgeSelection.exit().remove();

    // 渲染節點
    const nodesLayer = container.append('g').attr('class', 'nodes-layer');

    const nodeSelection = nodesLayer
      .selectAll<SVGGElement, Node>('.node-group')
      .data(storeNodes, (d) => d.id);

    const nodeEnter = nodeSelection
      .enter()
      .append('g')
      .attr('class', 'node-group');

    // 節點矩形背景
    nodeEnter
      .append('rect')
      .attr('class', 'node-rect')
      .attr('width', NODE_WIDTH)
      .attr('height', NODE_HEIGHT)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', (d) => (d.data.isTopic ? '#DBEAFE' : '#FFFFFF'))
      .attr('stroke', (d) =>
        selectedNodeIds.includes(d.id) ? '#3B82F6' : '#E5E7EB'
      )
      .attr('stroke-width', (d) => (selectedNodeIds.includes(d.id) ? 2 : 1))
      .attr('cursor', 'move')
      .style('transition', 'all 0.2s');

    // 節點文字
    nodeEnter
      .append('text')
      .attr('class', 'node-text')
      .attr('x', NODE_WIDTH / 2)
      .attr('y', NODE_HEIGHT / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#111827')
      .attr('font-size', '14px')
      .attr('font-family', 'Inter, sans-serif')
      .text((d) => d.data.label || '未命名');

    // 合併並更新位置
    const nodeUpdate = nodeSelection.merge(
      nodeEnter as d3.Selection<SVGGElement, Node, SVGGElement, unknown>
    );

    nodeUpdate.attr(
      'transform',
      (d) => `translate(${d.position.x},${d.position.y})`
    );

    // 更新選中狀態
    nodeUpdate
      .select('.node-rect')
      .attr('stroke', (d) =>
        selectedNodeIds.includes(d.id) ? '#3B82F6' : '#E5E7EB'
      )
      .attr('stroke-width', (d) => (selectedNodeIds.includes(d.id) ? 2 : 1));

    // 實作拖曳功能
    const dragHandler = d3
      .drag<SVGGElement, Node>()
      .on('start', function (event) {
        d3.select(this).raise();
        d3.select(this).select('.node-rect').attr('opacity', 0.7);
        // 阻止事件冒泡，避免觸發背景點擊
        event.sourceEvent.stopPropagation();
      })
      .on('drag', function (event, d) {
        const newX = Math.max(0, event.x);
        const newY = Math.max(0, event.y);

        d3.select(this).attr('transform', `translate(${newX},${newY})`);

        // 更新節點位置
        updateNode({
          id: d.id,
          position: { x: newX, y: newY },
        });

        // 即時更新相關連線（從 SVG 中選擇）
        // 使用閉包中的 storeEdges 和 calculateEdgePath
        if (svgRef.current) {
          const svg = d3.select(svgRef.current);
          const edgesLayer = svg.select('.edges-layer');
          // 從 store 取得最新的 edges（使用閉包變數）
          const currentEdges = storeEdges;
          const relatedEdges = currentEdges.filter(
            (e) => e.source === d.id || e.target === d.id
          );
          relatedEdges.forEach((edge) => {
            const path = edgesLayer
              .selectAll<SVGPathElement, Edge>('.edge')
              .filter((e) => e.id === edge.id);
            // 重新計算路徑（使用最新的節點位置）
            const updatedPath = calculateEdgePath(edge);
            path.attr('d', updatedPath);
          });
        }
      })
      .on('end', function () {
        d3.select(this).select('.node-rect').attr('opacity', 1);
      });

    nodeUpdate.call(dragHandler as d3.DragBehavior<SVGGElement, Node, unknown>);

    // 實作點擊選擇功能
    nodeUpdate.on('click', function (event, d) {
      // 阻止事件冒泡，避免觸發背景點擊
      if (event.sourceEvent) {
        event.sourceEvent.stopPropagation();
      }

      const nativeEvent = event.sourceEvent as MouseEvent;
      if (
        nativeEvent?.shiftKey ||
        nativeEvent?.metaKey ||
        nativeEvent?.ctrlKey
      ) {
        // 多選模式
        if (selectedNodeIds.includes(d.id)) {
          setSelectedNodes(selectedNodeIds.filter((id) => id !== d.id));
        } else {
          setSelectedNodes([...selectedNodeIds, d.id]);
        }
      } else {
        // 單選模式
        setSelectedNodes([d.id]);
      }
    });

    // 添加 hover 效果
    nodeUpdate
      .on('mouseenter', function () {
        d3.select(this)
          .select('.node-rect')
          .attr('filter', 'url(#shadow)')
          .style('cursor', 'move');
      })
      .on('mouseleave', function () {
        d3.select(this).select('.node-rect').attr('filter', null);
      });

    nodeSelection.exit().remove();
  }, [
    storeNodes,
    storeEdges,
    selectedNodeIds,
    calculateEdgePath,
    updateNode,
    setSelectedNodes,
  ]);

  /**
   * 當資料變更時重新渲染
   */
  useEffect(() => {
    renderGraph();
  }, [renderGraph]);

  /**
   * 自動佈局
   */
  const handleAutoLayout = useCallback(() => {
    if (storeNodes.length === 0) return;

    const layoutedNodes = calculateHorizontalMindMapLayout(
      storeNodes,
      storeEdges
    );
    updateNodes(layoutedNodes);
  }, [storeNodes, storeEdges, updateNodes]);

  /**
   * 新增節點
   */
  const handleAddNode = useCallback(() => {
    if (storeNodes.length === 0) {
      // 新增第一個中心節點
      addNode({
        label: '中心主題',
        isTopic: true,
        nodeType: 'center',
        position: { x: 100, y: 300 },
      });
    } else if (selectedNodeIds.length > 0) {
      // 新增子節點到選中的節點
      addNode({
        label: '新主題',
        parentId: selectedNodeIds[0],
        nodeType: 'topic',
      });
    } else {
      // 沒有選中節點，新增主題節點
      addNode({
        label: '新主題',
        isTopic: true,
        nodeType: 'topic',
      });
    }
  }, [storeNodes.length, selectedNodeIds, addNode]);

  /**
   * 點擊空白處取消選擇
   */
  const handleSvgClick = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      // 只有點擊 SVG 本身或 graph-container 時才取消選擇（不是點擊節點或連線）
      const target = event.target as HTMLElement;

      // 檢查是否點擊了 SVG 本身或 graph-container
      // 如果 target 是 SVG 元素本身，或者包含 graph-container class
      if (
        target.tagName === 'svg' ||
        target.tagName === 'SVG' ||
        target.classList.contains('graph-container')
      ) {
        setSelectedNodes([]);
      }
    },
    [setSelectedNodes]
  );

  return (
    <div ref={containerRef} className="w-full h-full relative bg-gray-50">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ cursor: 'default' }}
        onClick={handleSvgClick}
      >
        {/* 定義陰影濾鏡 */}
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="4"
              floodColor="#000000"
              floodOpacity="0.1"
            />
          </filter>
        </defs>

        {/* 圖形容器 */}
        <g className="graph-container" />
      </svg>

      {/* 控制按鈕 */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={handleAddNode}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新增節點
        </button>
        {storeNodes.length > 0 && (
          <button
            onClick={handleAutoLayout}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          >
            自動排列
          </button>
        )}
      </div>

      {/* 空狀態提示 */}
      {storeNodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="text-center">
            <div className="text-gray-400 text-lg mb-2">尚未建立任何節點</div>
            <div className="text-gray-300 text-sm">
              點擊右上角的「新增節點」按鈕開始建立心智圖
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

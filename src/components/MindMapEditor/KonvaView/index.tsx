/**
 * KonvaView 組件
 * 使用 Konva.js + Canvas 實作心智圖編輯器
 */

'use client';

import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { Stage, Layer, Group, Rect, Text, Line } from 'react-konva';
import Konva from 'konva';
import { Plus } from 'lucide-react';
import { useMindMapStore } from '@/stores/mindmapStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { calculateHorizontalMindMapLayout } from '@/utils/layoutAlgorithms/horizontalMindMap';
import type { Edge } from '@/types/mindmap';

/**
 * 節點尺寸常數
 */
const NODE_WIDTH = 150;
const NODE_HEIGHT = 50;

/**
 * 連線顏色清單（循環使用）
 */
const EDGE_COLORS = [
  '#10B981', // 綠色
  '#F59E0B', // 黃色
  '#3B82F6', // 藍色
  '#8B5CF6', // 紫色
  '#EC4899', // 粉色
  '#F97316', // 橙色
];

/**
 * KonvaView 組件
 */
export function KonvaView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const lastPointerPositionRef = useRef({ x: 0, y: 0 });

  // 從 Store 取得資料和操作函式
  const {
    nodes: storeNodes,
    edges: storeEdges,
    selectedNodeIds,
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
   * 計算連線路徑點（二次貝茲曲線）
   * 連線從邊框外部邊緣開始
   */
  const calculateEdgePoints = useCallback(
    (edge: Edge): number[] => {
      const sourceNode = storeNodes.find((n) => n.id === edge.source);
      const targetNode = storeNodes.find((n) => n.id === edge.target);

      if (!sourceNode || !targetNode) return [];

      // 計算節點中心位置
      const sourceCenterX = sourceNode.position.x + NODE_WIDTH / 2;
      const sourceCenterY = sourceNode.position.y + NODE_HEIGHT / 2;
      const targetCenterX = targetNode.position.x + NODE_WIDTH / 2;
      const targetCenterY = targetNode.position.y + NODE_HEIGHT / 2;

      // 計算方向向量
      const dx = targetCenterX - sourceCenterX;
      const dy = targetCenterY - sourceCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance === 0) return [];

      // 標準化方向向量
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;

      // 計算邊框邊緣的交點（從源節點邊框外緣開始）
      const halfWidth = NODE_WIDTH / 2;
      const halfHeight = NODE_HEIGHT / 2;

      // 計算射線與矩形邊框的交點
      // 使用參數方程：P = center + t * direction
      // 找出與邊框的交點
      // 計算與各邊框的交點參數 t
      const tLeft = normalizedDx !== 0 ? -halfWidth / normalizedDx : Infinity;
      const tRight = normalizedDx !== 0 ? halfWidth / normalizedDx : Infinity;
      const tTop = normalizedDy !== 0 ? -halfHeight / normalizedDy : Infinity;
      const tBottom = normalizedDy !== 0 ? halfHeight / normalizedDy : Infinity;

      // 找出最小的正 t 值（最接近的邊框交點）
      const validTs: number[] = [];
      if (tLeft > 0 && tLeft !== Infinity) validTs.push(tLeft);
      if (tRight > 0 && tRight !== Infinity) validTs.push(tRight);
      if (tTop > 0 && tTop !== Infinity) validTs.push(tTop);
      if (tBottom > 0 && tBottom !== Infinity) validTs.push(tBottom);

      const t = validTs.length > 0 ? Math.min(...validTs) : 0;

      // 計算邊框邊緣的交點
      const sourceEdgeX = sourceCenterX + normalizedDx * t;
      const sourceEdgeY = sourceCenterY + normalizedDy * t;

      // 同樣計算目標節點的邊框邊緣交點（從目標節點指向源節點）
      const targetDx = -normalizedDx;
      const targetDy = -normalizedDy;

      const targetTLeft = targetDx !== 0 ? -halfWidth / targetDx : Infinity;
      const targetTRight = targetDx !== 0 ? halfWidth / targetDx : Infinity;
      const targetTTop = targetDy !== 0 ? -halfHeight / targetDy : Infinity;
      const targetTBottom = targetDy !== 0 ? halfHeight / targetDy : Infinity;

      const targetValidTs: number[] = [];
      if (targetTLeft > 0 && targetTLeft !== Infinity)
        targetValidTs.push(targetTLeft);
      if (targetTRight > 0 && targetTRight !== Infinity)
        targetValidTs.push(targetTRight);
      if (targetTTop > 0 && targetTTop !== Infinity)
        targetValidTs.push(targetTTop);
      if (targetTBottom > 0 && targetTBottom !== Infinity)
        targetValidTs.push(targetTBottom);

      const targetT = targetValidTs.length > 0 ? Math.min(...targetValidTs) : 0;

      const targetEdgeX = targetCenterX + targetDx * targetT;
      const targetEdgeY = targetCenterY + targetDy * targetT;

      // 使用二次貝茲曲線（quadratic curve）
      const controlX = (sourceEdgeX + targetEdgeX) / 2;
      const controlY = sourceEdgeY; // 控制點在起點的水平線上

      // 生成曲線上的點（使用二次貝茲曲線公式）
      const points: number[] = [];
      const steps = 20; // 曲線分段數
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x =
          (1 - t) * (1 - t) * sourceEdgeX +
          2 * (1 - t) * t * controlX +
          t * t * targetEdgeX;
        const y =
          (1 - t) * (1 - t) * sourceEdgeY +
          2 * (1 - t) * t * controlY +
          t * t * targetEdgeY;
        points.push(x, y);
      }

      return points;
    },
    [storeNodes]
  );

  /**
   * 更新 Stage 尺寸
   */
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setStageSize({ width, height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  /**
   * 自動佈局：當節點或邊改變時自動重新計算佈局
   */
  useEffect(() => {
    if (storeNodes.length === 0 || stageSize.width === 0) return;

    // 計算畫布中心位置
    const centerX = stageSize.width / 2 - NODE_WIDTH / 2;
    const centerY = stageSize.height / 2 - NODE_HEIGHT / 2;

    const layoutedNodes = calculateHorizontalMindMapLayout(
      storeNodes,
      storeEdges,
      {
        centerX,
        centerY,
        horizontalSpacing: 350,
        verticalSpacing: 150,
        nodeWidth: NODE_WIDTH,
        nodeHeight: NODE_HEIGHT,
      }
    );

    // 檢查是否有節點位置需要更新
    const needsUpdate = layoutedNodes.some((layoutedNode) => {
      const originalNode = storeNodes.find((n) => n.id === layoutedNode.id);
      if (!originalNode) return true;
      return (
        Math.abs(layoutedNode.position.x - originalNode.position.x) > 1 ||
        Math.abs(layoutedNode.position.y - originalNode.position.y) > 1
      );
    });

    if (needsUpdate) {
      updateNodes(layoutedNodes);
    }
  }, [storeNodes, storeEdges, stageSize, updateNodes]);

  /**
   * 自動佈局：當節點或邊改變時自動重新計算佈局
   */
  useEffect(() => {
    if (storeNodes.length === 0 || stageSize.width === 0) return;

    // 計算畫布中心位置
    const centerX = stageSize.width / 2 - NODE_WIDTH / 2;
    const centerY = stageSize.height / 2 - NODE_HEIGHT / 2;

    const layoutedNodes = calculateHorizontalMindMapLayout(
      storeNodes,
      storeEdges,
      {
        centerX,
        centerY,
        horizontalSpacing: 350,
        verticalSpacing: 150,
        nodeWidth: NODE_WIDTH,
        nodeHeight: NODE_HEIGHT,
      }
    );

    // 檢查是否有節點位置需要更新
    const needsUpdate = layoutedNodes.some((layoutedNode) => {
      const originalNode = storeNodes.find((n) => n.id === layoutedNode.id);
      if (!originalNode) return true;
      return (
        Math.abs(layoutedNode.position.x - originalNode.position.x) > 1 ||
        Math.abs(layoutedNode.position.y - originalNode.position.y) > 1
      );
    });

    if (needsUpdate) {
      updateNodes(layoutedNodes);
    }
  }, [storeNodes, storeEdges, stageSize, updateNodes]);

  /**
   * 處理節點點擊
   */
  const handleNodeClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>, nodeId: string) => {
      e.cancelBubble = true; // 阻止事件冒泡

      const nativeEvent = e.evt;
      const isMultiSelect =
        (nativeEvent instanceof MouseEvent &&
          (nativeEvent.shiftKey ||
            nativeEvent.metaKey ||
            nativeEvent.ctrlKey)) ||
        (nativeEvent instanceof TouchEvent && false); // Touch 事件不支援多選

      if (isMultiSelect) {
        // 多選模式
        if (selectedNodeIds.includes(nodeId)) {
          setSelectedNodes(selectedNodeIds.filter((id) => id !== nodeId));
        } else {
          setSelectedNodes([...selectedNodeIds, nodeId]);
        }
      } else {
        // 單選模式
        setSelectedNodes([nodeId]);
      }
    },
    [selectedNodeIds, setSelectedNodes]
  );

  /**
   * 處理 Stage 點擊（點擊空白處取消選擇）
   */
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // 如果點擊的是 Stage 本身（不是節點或連線），取消選擇
      if (e.target === e.target.getStage()) {
        setSelectedNodes([]);
      }
    },
    [setSelectedNodes]
  );

  /**
   * 處理畫布縮放（Command + 滾輪）
   */
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    const nativeEvent = e.evt;
    // 檢查是否按下 Command 鍵（Mac）或 Ctrl 鍵（Windows/Linux）
    const isCommandPressed = nativeEvent.metaKey || nativeEvent.ctrlKey;

    if (!isCommandPressed) return;

    e.evt.preventDefault();

    const stage = e.target.getStage();
    if (!stage) return;

    // 取得滑鼠位置相對於畫布的位置
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // 計算縮放比例（滾輪向上放大，向下縮小）
    const scaleBy = 1.1;
    const oldScale = stage.scaleX();
    const newScale =
      nativeEvent.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    // 限制縮放範圍
    const clampedScale = Math.max(0.1, Math.min(5, newScale));
    setStageScale(clampedScale);

    // 計算縮放中心點的位置變化
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    setStagePosition(newPos);
  }, []);

  /**
   * 處理畫布拖曳開始
   */
  const handleStageDragStart = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      // 只有在點擊空白處時才允許拖曳畫布
      if (e.target === e.target.getStage()) {
        isDraggingRef.current = true;
        const stage = e.target.getStage();
        if (stage) {
          const pointer = stage.getPointerPosition();
          if (pointer) {
            lastPointerPositionRef.current = pointer;
          }
        }
      }
    },
    []
  );

  /**
   * 處理畫布拖曳中
   */
  const handleStageDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (!isDraggingRef.current) return;

      const stage = e.target.getStage();
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const newPos = {
        x: stage.x() + (pointer.x - lastPointerPositionRef.current.x),
        y: stage.y() + (pointer.y - lastPointerPositionRef.current.y),
      };

      setStagePosition(newPos);
      lastPointerPositionRef.current = pointer;
    },
    []
  );

  /**
   * 處理畫布拖曳結束
   */
  const handleStageDragEnd = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  /**
   * 自動佈局
   * Root 節點在畫布中心，其他節點向右延伸
   */
  const handleAutoLayout = useCallback(() => {
    if (storeNodes.length === 0) return;

    // 計算畫布中心位置
    const centerX =
      stageSize.width > 0 ? stageSize.width / 2 - NODE_WIDTH / 2 : 400;
    const centerY =
      stageSize.height > 0 ? stageSize.height / 2 - NODE_HEIGHT / 2 : 300;

    const layoutedNodes = calculateHorizontalMindMapLayout(
      storeNodes,
      storeEdges,
      {
        centerX,
        centerY,
        horizontalSpacing: 350,
        verticalSpacing: 150,
        nodeWidth: NODE_WIDTH,
        nodeHeight: NODE_HEIGHT,
      }
    );
    updateNodes(layoutedNodes);
  }, [storeNodes, storeEdges, stageSize, updateNodes]);

  /**
   * 新增節點
   */
  const handleAddNode = useCallback(() => {
    if (storeNodes.length === 0) {
      // 新增第一個中心節點（放在畫布中心）
      const centerX =
        stageSize.width > 0 ? stageSize.width / 2 - NODE_WIDTH / 2 : 400;
      const centerY =
        stageSize.height > 0 ? stageSize.height / 2 - NODE_HEIGHT / 2 : 300;
      addNode({
        label: '中心主題',
        isTopic: true,
        nodeType: 'center',
        position: { x: centerX, y: centerY },
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
  }, [storeNodes.length, selectedNodeIds, stageSize, addNode]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-white">
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePosition.x}
        y={stagePosition.y}
        draggable={true}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onWheel={handleWheel}
        onDragStart={handleStageDragStart}
        onDragMove={handleStageDragMove}
        onDragEnd={handleStageDragEnd}
      >
        {/* 連線層（在節點下方） */}
        <Layer>
          {storeEdges.map((edge, index) => {
            const points = calculateEdgePoints(edge);
            if (points.length === 0) return null;

            // 循環使用顏色
            const edgeColor = EDGE_COLORS[index % EDGE_COLORS.length];

            return (
              <Line
                key={edge.id}
                points={points}
                stroke={edgeColor}
                strokeWidth={2.5}
                lineCap="round"
                lineJoin="round"
                perfectDraw={false}
                hitStrokeWidth={0}
              />
            );
          })}
        </Layer>

        {/* 節點層 */}
        <Layer>
          {storeNodes.map((node) => {
            const isSelected = selectedNodeIds.includes(node.id);

            return (
              <Group
                key={node.id}
                x={node.position.x}
                y={node.position.y}
                draggable={false}
                onClick={(e) => handleNodeClick(e, node.id)}
                onTap={(e) => {
                  // onTap 事件類型轉換
                  const mouseEvent = e.evt as unknown as MouseEvent;
                  const konvaEvent = {
                    ...e,
                    evt: mouseEvent,
                  } as Konva.KonvaEventObject<MouseEvent>;
                  handleNodeClick(konvaEvent, node.id);
                }}
              >
                {/* 透明的點擊區域 */}
                <Rect
                  x={0}
                  y={0}
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  fill="transparent"
                  listening={true}
                />

                {/* 選中時的邊框 */}
                {isSelected && (
                  <Rect
                    x={0}
                    y={0}
                    width={NODE_WIDTH}
                    height={NODE_HEIGHT}
                    fill="transparent"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    cornerRadius={4}
                    listening={false}
                  />
                )}

                {/* 節點文字 */}
                <Text
                  x={0}
                  y={0}
                  text={node.data.label || '未命名'}
                  fontSize={14}
                  fontFamily="Inter, sans-serif"
                  fill={isSelected ? '#3B82F6' : '#4B5563'}
                  align="center"
                  verticalAlign="middle"
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  listening={false}
                  textDecoration={isSelected ? 'underline' : ''}
                />
              </Group>
            );
          })}
        </Layer>
      </Stage>

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

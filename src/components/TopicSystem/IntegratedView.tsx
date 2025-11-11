/**
 * Topic 整合視圖
 * 使用 Mock 資料顯示合併後的 nodes
 */

'use client';

import { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { format } from 'date-fns';
import { useMockTopicNodes } from '@/__mocks__/hooks';
import { CustomNode } from '@/components/MindMapEditor/RadialView/CustomNode';

interface IntegratedViewProps {
  /** Topic ID */
  topicId: string;
}

/**
 * Node 類型對應表
 */
const nodeTypes = {
  custom: CustomNode,
  topic: CustomNode,
};

/**
 * Topic 整合視圖
 */
export function IntegratedView({ topicId }: IntegratedViewProps) {
  // 使用 Mock Hook 查詢該 Topic 相關的所有 nodes
  const { data: topicData, isLoading } = useMockTopicNodes(topicId);

  /**
   * 將 Topic nodes 轉換為 React Flow 格式
   * 合併重複的內容，保留來源日期資訊
   */
  const { nodes, edges } = useMemo(() => {
    if (!topicData?.nodes) {
      return { nodes: [], edges: [] };
    }

    // 建立 label -> node 的 Map，合併重複內容
    const mergedNodesMap = new Map<string, Node>();
    const sourceDatesMap = new Map<string, Set<string>>(); // nodeId -> dates

    topicData.nodes.forEach((node) => {
      const label = node.data.label;

      if (!mergedNodesMap.has(label)) {
        // 第一次遇到這個 label，建立新 node
        const newNode: Node = {
          id: node.id,
          type: 'custom',
          position: node.position,
          data: {
            ...node.data,
            // 新增來源日期資訊
            sourceDates: [format(node.createdAt, 'yyyy/MM/dd')],
          },
        };
        mergedNodesMap.set(label, newNode);
        sourceDatesMap.set(
          node.id,
          new Set([format(node.createdAt, 'yyyy/MM/dd')])
        );
      } else {
        // 已經存在相同 label 的 node，合併日期資訊
        const existingNode = mergedNodesMap.get(label)!;
        const dates = sourceDatesMap.get(existingNode.id)!;
        dates.add(format(node.createdAt, 'yyyy/MM/dd'));

        existingNode.data.sourceDates = Array.from(dates);
      }
    });

    // 轉換 edges
    const flowEdges: Edge[] = topicData.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'default',
    }));

    return {
      nodes: Array.from(mergedNodesMap.values()),
      edges: flowEdges,
    };
  }, [topicData]);

  // 載入中狀態
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">載入中...</div>
      </div>
    );
  }

  // 沒有 nodes
  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">
          <p className="text-lg mb-2">尚未有任何記錄</p>
          <p className="text-sm">開始編輯心智圖時標記為此 Topic 吧！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

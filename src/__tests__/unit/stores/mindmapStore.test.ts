/**
 * MindMapStore 單元測試
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useMindMapStore } from '@/stores/mindmapStore';
import type { AddNodeParams } from '@/types/mindmap';

describe('MindMapStore', () => {
  beforeEach(() => {
    // 每個測試前重置 Store
    useMindMapStore.getState().reset();
  });

  describe('addNode', () => {
    it('應該正確新增一個 Node', () => {
      const store = useMindMapStore.getState();

      const params: AddNodeParams = {
        label: 'Test Node',
        position: { x: 100, y: 100 },
      };

      const nodeId = store.addNode(params);

      const nodes = useMindMapStore.getState().nodes;

      expect(nodes).toHaveLength(1);
      expect(nodes[0].id).toBe(nodeId);
      expect(nodes[0].data.label).toBe('Test Node');
      expect(nodes[0].position).toEqual({ x: 100, y: 100 });
    });

    it('應該在有父節點時自動建立 Edge', () => {
      const store = useMindMapStore.getState();

      // 先建立父節點
      const parentId = store.addNode({ label: 'Parent' });

      // 建立子節點
      const childId = store.addNode({
        label: 'Child',
        parentId,
      });

      const edges = useMindMapStore.getState().edges;

      expect(edges).toHaveLength(1);
      expect(edges[0].source).toBe(parentId);
      expect(edges[0].target).toBe(childId);
    });
  });

  describe('updateNode', () => {
    it('應該正確更新 Node 的資料', () => {
      const store = useMindMapStore.getState();

      const nodeId = store.addNode({ label: 'Original' });

      store.updateNode({
        id: nodeId,
        data: { label: 'Updated' },
      });

      const node = useMindMapStore.getState().nodes[0];

      expect(node.data.label).toBe('Updated');
    });

    it('應該正確更新 Node 的位置', () => {
      const store = useMindMapStore.getState();

      const nodeId = store.addNode({ label: 'Test' });

      store.updateNode({
        id: nodeId,
        position: { x: 200, y: 300 },
      });

      const node = useMindMapStore.getState().nodes[0];

      expect(node.position).toEqual({ x: 200, y: 300 });
    });
  });

  describe('deleteNode', () => {
    it('應該刪除單一 Node', () => {
      const store = useMindMapStore.getState();

      const nodeId = store.addNode({ label: 'Test' });

      store.deleteNode(nodeId);

      const nodes = useMindMapStore.getState().nodes;

      expect(nodes).toHaveLength(0);
    });

    it('應該刪除 Node 及其所有子孫節點', () => {
      const store = useMindMapStore.getState();

      // 建立階層結構
      const rootId = store.addNode({ label: 'Root' });
      const child1Id = store.addNode({ label: 'Child 1', parentId: rootId });
      store.addNode({ label: 'Child 2', parentId: rootId });
      store.addNode({
        label: 'Grandchild',
        parentId: child1Id,
      });

      // 刪除 root
      store.deleteNode(rootId);

      const nodes = useMindMapStore.getState().nodes;
      const edges = useMindMapStore.getState().edges;

      expect(nodes).toHaveLength(0);
      expect(edges).toHaveLength(0);
    });
  });

  describe('loadMindMap', () => {
    it('應該正確載入完整的 MindMap 資料', () => {
      const store = useMindMapStore.getState();

      const mockNodes = [
        {
          id: '1',
          type: 'custom' as const,
          position: { x: 0, y: 0 },
          data: { label: 'Node 1' },
        },
        {
          id: '2',
          type: 'custom' as const,
          position: { x: 100, y: 100 },
          data: { label: 'Node 2' },
        },
      ];

      const mockEdges = [
        {
          id: 'e1-2',
          source: '1',
          target: '2',
        },
      ];

      store.loadMindMap(mockNodes, mockEdges);

      const { nodes, edges } = useMindMapStore.getState();

      expect(nodes).toEqual(mockNodes);
      expect(edges).toEqual(mockEdges);
    });
  });

  describe('Edge 操作', () => {
    it('應該可以新增 Edge', () => {
      const store = useMindMapStore.getState();

      const node1Id = store.addNode({ label: 'Node 1' });
      const node2Id = store.addNode({ label: 'Node 2' });

      store.addEdge(node1Id, node2Id);

      const edges = useMindMapStore.getState().edges;

      expect(edges).toHaveLength(1);
      expect(edges[0].source).toBe(node1Id);
      expect(edges[0].target).toBe(node2Id);
    });

    it('應該可以刪除 Edge', () => {
      const store = useMindMapStore.getState();

      const node1Id = store.addNode({ label: 'Node 1' });
      const node2Id = store.addNode({ label: 'Node 2' });

      store.addEdge(node1Id, node2Id);
      const edgeId = useMindMapStore.getState().edges[0].id;

      store.deleteEdge(edgeId);

      const edges = useMindMapStore.getState().edges;

      expect(edges).toHaveLength(0);
    });

    it('不應該重複新增相同的 Edge', () => {
      const store = useMindMapStore.getState();

      const node1Id = store.addNode({ label: 'Node 1' });
      const node2Id = store.addNode({ label: 'Node 2' });

      store.addEdge(node1Id, node2Id);
      store.addEdge(node1Id, node2Id); // 重複新增

      const edges = useMindMapStore.getState().edges;

      expect(edges).toHaveLength(1);
    });
  });

  describe('選擇操作', () => {
    it('應該可以設定選中的 Nodes', () => {
      const store = useMindMapStore.getState();

      const node1Id = store.addNode({ label: 'Node 1' });
      const node2Id = store.addNode({ label: 'Node 2' });

      store.setSelectedNodes([node1Id, node2Id]);

      const selectedNodeIds = useMindMapStore.getState().selectedNodeIds;

      expect(selectedNodeIds).toEqual([node1Id, node2Id]);
    });

    it('應該可以清除選擇', () => {
      const store = useMindMapStore.getState();

      const nodeId = store.addNode({ label: 'Node 1' });

      store.setSelectedNodes([nodeId]);
      store.clearSelection();

      const selectedNodeIds = useMindMapStore.getState().selectedNodeIds;

      expect(selectedNodeIds).toHaveLength(0);
    });

    it('刪除 Node 時應該同時清除選擇', () => {
      const store = useMindMapStore.getState();

      const nodeId = store.addNode({ label: 'Node 1' });

      store.setSelectedNodes([nodeId]);
      store.deleteNode(nodeId);

      const selectedNodeIds = useMindMapStore.getState().selectedNodeIds;

      expect(selectedNodeIds).toHaveLength(0);
    });
  });
});

/**
 * D3 Tree Layout 測試
 */

import { describe, it, expect } from 'vitest';
import { calculateTreeLayout } from '@/utils/layoutAlgorithms/d3Tree';
import type { Node, Edge } from '@/types/mindmap';

describe('calculateTreeLayout', () => {
  it('應該計算 Tree Layout 位置', () => {
    const nodes: Node[] = [
      {
        id: '1',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { label: 'Root' },
      },
      {
        id: '2',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { label: 'Child' },
      },
    ];

    const edges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];

    const treeNodes = calculateTreeLayout(nodes, edges, {
      direction: 'TB',
    });

    expect(treeNodes).toHaveLength(2);
    expect(treeNodes[0].depth).toBe(0);
    expect(treeNodes[1].depth).toBe(1);
  });

  it('應該根據方向調整座標', () => {
    const nodes: Node[] = [
      {
        id: '1',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { label: 'Root' },
      },
      {
        id: '2',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { label: 'Child' },
      },
    ];

    const edges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];

    const tbNodes = calculateTreeLayout(nodes, edges, { direction: 'TB' });
    const lrNodes = calculateTreeLayout(nodes, edges, { direction: 'LR' });

    // TB 和 LR 的子節點座標應該不同（x 和 y 交換）
    const tbChild = tbNodes.find((n) => n.id === '2');
    const lrChild = lrNodes.find((n) => n.id === '2');

    expect(tbChild).toBeDefined();
    expect(lrChild).toBeDefined();

    if (tbChild && lrChild) {
      // 在 TB 模式下，x 應該相同（垂直排列），y 應該不同
      // 在 LR 模式下，x 和 y 會交換
      expect(tbChild.x).not.toBe(lrChild.x);
      expect(tbChild.y).not.toBe(lrChild.y);
    }
  });

  it('應該處理多層級樹狀結構', () => {
    const nodes: Node[] = [
      {
        id: '1',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { label: 'Root' },
      },
      {
        id: '2',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { label: 'Child 1' },
      },
      {
        id: '3',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { label: 'Child 2' },
      },
      {
        id: '4',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { label: 'Grandchild' },
      },
    ];

    const edges: Edge[] = [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e1-3', source: '1', target: '3' },
      { id: 'e2-4', source: '2', target: '4' },
    ];

    const treeNodes = calculateTreeLayout(nodes, edges, {
      direction: 'TB',
    });

    expect(treeNodes).toHaveLength(4);

    // 驗證深度
    const rootNode = treeNodes.find((n) => n.id === '1');
    const childNodes = treeNodes.filter((n) => n.id === '2' || n.id === '3');
    const grandchildNode = treeNodes.find((n) => n.id === '4');

    expect(rootNode?.depth).toBe(0);
    childNodes.forEach((child) => {
      expect(child.depth).toBe(1);
    });
    expect(grandchildNode?.depth).toBe(2);
  });

  it('應該處理空節點陣列', () => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const treeNodes = calculateTreeLayout(nodes, edges, {
      direction: 'TB',
    });

    expect(treeNodes).toHaveLength(0);
  });

  it('應該處理單一節點', () => {
    const nodes: Node[] = [
      {
        id: '1',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { label: 'Root' },
      },
    ];

    const edges: Edge[] = [];

    const treeNodes = calculateTreeLayout(nodes, edges, {
      direction: 'TB',
    });

    expect(treeNodes).toHaveLength(1);
    expect(treeNodes[0].id).toBe('1');
    expect(treeNodes[0].depth).toBe(0);
  });

  it('應該處理沒有 Edge 的情況', () => {
    const nodes: Node[] = [
      {
        id: '1',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { label: 'Node 1' },
      },
      {
        id: '2',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { label: 'Node 2' },
      },
    ];

    const edges: Edge[] = [];

    const treeNodes = calculateTreeLayout(nodes, edges, {
      direction: 'TB',
    });

    // 沒有 Edge 時，應該只返回第一個節點作為根節點
    expect(treeNodes.length).toBeGreaterThan(0);
    expect(treeNodes[0].id).toBe('1');
  });

  it('應該正確設定節點的 x 和 y 座標', () => {
    const nodes: Node[] = [
      {
        id: '1',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { label: 'Root' },
      },
      {
        id: '2',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { label: 'Child' },
      },
    ];

    const edges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];

    const treeNodes = calculateTreeLayout(nodes, edges, {
      direction: 'TB',
    });

    treeNodes.forEach((node) => {
      expect(typeof node.x).toBe('number');
      expect(typeof node.y).toBe('number');
      expect(Number.isFinite(node.x)).toBe(true);
      expect(Number.isFinite(node.y)).toBe(true);
    });
  });
});

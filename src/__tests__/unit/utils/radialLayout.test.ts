/**
 * Radial 佈局演算法測試
 */

import { describe, it, expect } from 'vitest';
import { calculateRadialLayout } from '@/utils/layoutAlgorithms/radial';
import type { Node, Edge } from '@/types/mindmap';

describe('calculateRadialLayout', () => {
  it('應該為所有 Nodes 計算位置', () => {
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

    const edges: Edge[] = [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
      },
    ];

    const layoutedNodes = calculateRadialLayout(nodes, edges);

    // 驗證所有節點都有位置資訊
    expect(layoutedNodes).toHaveLength(2);
    expect(layoutedNodes[0].position).toBeDefined();
    expect(layoutedNodes[1].position).toBeDefined();
    expect(typeof layoutedNodes[0].position.x).toBe('number');
    expect(typeof layoutedNodes[0].position.y).toBe('number');
    expect(typeof layoutedNodes[1].position.x).toBe('number');
    expect(typeof layoutedNodes[1].position.y).toBe('number');
  });

  it('應該保持階層關係', () => {
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

    const edges: Edge[] = [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
      },
    ];

    const layoutedNodes = calculateRadialLayout(nodes, edges);

    // Root 應該在 Child 上方
    expect(layoutedNodes[0].position.y).toBeLessThan(
      layoutedNodes[1].position.y
    );
  });

  it('應該處理沒有 Edge 的情況', () => {
    const nodes: Node[] = [
      {
        id: '1',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { label: 'Root' },
      },
    ];

    const edges: Edge[] = [];

    const layoutedNodes = calculateRadialLayout(nodes, edges);

    // 應該仍然計算位置
    expect(layoutedNodes).toHaveLength(1);
    expect(layoutedNodes[0].position.x).toBeDefined();
    expect(layoutedNodes[0].position.y).toBeDefined();
  });

  it('應該處理多層階層結構', () => {
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
      {
        id: 'e1-2',
        source: '1',
        target: '2',
      },
      {
        id: 'e1-3',
        source: '1',
        target: '3',
      },
      {
        id: 'e2-4',
        source: '2',
        target: '4',
      },
    ];

    const layoutedNodes = calculateRadialLayout(nodes, edges);

    // 驗證所有節點都有位置
    layoutedNodes.forEach((node) => {
      expect(node.position.x).toBeDefined();
      expect(node.position.y).toBeDefined();
    });

    // Root 應該在最上方
    const rootNode = layoutedNodes.find((n) => n.id === '1');
    const childNodes = layoutedNodes.filter((n) => n.id !== '1');
    expect(rootNode).toBeDefined();
    if (rootNode) {
      childNodes.forEach((child) => {
        expect(rootNode.position.y).toBeLessThan(child.position.y);
      });
    }
  });
});

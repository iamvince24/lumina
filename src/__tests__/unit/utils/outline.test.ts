/**
 * Outline 資料轉換測試
 */

import { describe, it, expect } from 'vitest';
import {
  nodesToOutline,
  outlineToNodes,
  flattenOutlineItems,
} from '@/utils/dataTransform/outline';
import type { Node, Edge } from '@/types/mindmap';
import type { OutlineItem } from '@/types/view';

describe('nodesToOutline', () => {
  it('應該正確轉換 Nodes 為 Outline 結構', () => {
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
    ];

    const edges: Edge[] = [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e1-3', source: '1', target: '3' },
    ];

    const outline = nodesToOutline(nodes, edges);

    expect(outline).toHaveLength(1);
    expect(outline[0].label).toBe('Root');
    expect(outline[0].children).toHaveLength(2);
    expect(outline[0].level).toBe(0);
    expect(outline[0].children[0].level).toBe(1);
  });

  it('應該處理多個根節點', () => {
    const nodes: Node[] = [
      {
        id: '1',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { label: 'Root 1' },
      },
      {
        id: '2',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { label: 'Root 2' },
      },
    ];

    const edges: Edge[] = [];

    const outline = nodesToOutline(nodes, edges);

    expect(outline).toHaveLength(2);
  });

  it('應該正確處理深層階層結構', () => {
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
        data: { label: 'Grandchild' },
      },
    ];

    const edges: Edge[] = [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ];

    const outline = nodesToOutline(nodes, edges);

    expect(outline).toHaveLength(1);
    expect(outline[0].children[0].children[0].label).toBe('Grandchild');
    expect(outline[0].children[0].children[0].level).toBe(2);
  });
});

describe('outlineToNodes', () => {
  it('應該正確將 Outline 轉換回 Nodes 和 Edges', () => {
    const node1: Node = {
      id: '1',
      type: 'custom',
      position: { x: 0, y: 0 },
      data: { label: 'Root' },
    };

    const node2: Node = {
      id: '2',
      type: 'custom',
      position: { x: 0, y: 0 },
      data: { label: 'Child' },
    };

    const outline: OutlineItem[] = [
      {
        id: '1',
        label: 'Root',
        level: 0,
        children: [
          {
            id: '2',
            label: 'Child',
            level: 1,
            children: [],
            isCollapsed: false,
            isFocused: false,
            nodeRef: node2,
          },
        ],
        isCollapsed: false,
        isFocused: false,
        nodeRef: node1,
      },
    ];

    const { nodes, edges } = outlineToNodes(outline);

    expect(nodes).toHaveLength(2);
    expect(edges).toHaveLength(1);
    expect(edges[0].source).toBe('1');
    expect(edges[0].target).toBe('2');
  });
});

describe('flattenOutlineItems', () => {
  it('應該正確扁平化 Outline', () => {
    const node1: Node = {
      id: '1',
      type: 'custom',
      position: { x: 0, y: 0 },
      data: { label: 'Root' },
    };

    const node2: Node = {
      id: '2',
      type: 'custom',
      position: { x: 0, y: 0 },
      data: { label: 'Child' },
    };

    const outline: OutlineItem[] = [
      {
        id: '1',
        label: 'Root',
        level: 0,
        children: [
          {
            id: '2',
            label: 'Child',
            level: 1,
            children: [],
            isCollapsed: false,
            isFocused: false,
            nodeRef: node2,
          },
        ],
        isCollapsed: false,
        isFocused: false,
        nodeRef: node1,
      },
    ];

    const flat = flattenOutlineItems(outline);

    expect(flat).toHaveLength(2);
    expect(flat[0].label).toBe('Root');
    expect(flat[1].label).toBe('Child');
  });

  it('應該考慮收合狀態', () => {
    const node1: Node = {
      id: '1',
      type: 'custom',
      position: { x: 0, y: 0 },
      data: { label: 'Root' },
    };

    const node2: Node = {
      id: '2',
      type: 'custom',
      position: { x: 0, y: 0 },
      data: { label: 'Child' },
    };

    const outline: OutlineItem[] = [
      {
        id: '1',
        label: 'Root',
        level: 0,
        children: [
          {
            id: '2',
            label: 'Child',
            level: 1,
            children: [],
            isCollapsed: false,
            isFocused: false,
            nodeRef: node2,
          },
        ],
        isCollapsed: true, // 已收合
        isFocused: false,
        nodeRef: node1,
      },
    ];

    const flat = flattenOutlineItems(outline);

    // 收合時不應該包含子項目
    expect(flat).toHaveLength(1);
    expect(flat[0].label).toBe('Root');
  });

  it('應該正確處理多層收合', () => {
    const node1: Node = {
      id: '1',
      type: 'custom',
      position: { x: 0, y: 0 },
      data: { label: 'Root' },
    };

    const node2: Node = {
      id: '2',
      type: 'custom',
      position: { x: 0, y: 0 },
      data: { label: 'Child' },
    };

    const node3: Node = {
      id: '3',
      type: 'custom',
      position: { x: 0, y: 0 },
      data: { label: 'Grandchild' },
    };

    const outline: OutlineItem[] = [
      {
        id: '1',
        label: 'Root',
        level: 0,
        children: [
          {
            id: '2',
            label: 'Child',
            level: 1,
            children: [
              {
                id: '3',
                label: 'Grandchild',
                level: 2,
                children: [],
                isCollapsed: false,
                isFocused: false,
                nodeRef: node3,
              },
            ],
            isCollapsed: true, // 收合
            isFocused: false,
            nodeRef: node2,
          },
        ],
        isCollapsed: false,
        isFocused: false,
        nodeRef: node1,
      },
    ];

    const flat = flattenOutlineItems(outline);

    // 應該只包含 Root 和 Child，不包含 Grandchild
    expect(flat).toHaveLength(2);
    expect(flat[0].label).toBe('Root');
    expect(flat[1].label).toBe('Child');
  });
});

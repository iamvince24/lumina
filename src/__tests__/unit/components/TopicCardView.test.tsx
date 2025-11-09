/**
 * TopicCardView 測試
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { TopicCardView } from '@/components/TopicSystem/TopicCardView';
import { useMindMapStore } from '@/stores/mindmapStore';

describe('TopicCardView', () => {
  beforeEach(() => {
    useMindMapStore.getState().reset();
  });

  it('應該顯示空狀態', () => {
    render(<TopicCardView topicId="topic-1" />);

    expect(screen.getByText('尚無內容')).toBeInTheDocument();
    expect(screen.getByText('開始新增節點來建立知識結構')).toBeInTheDocument();
  });

  it('應該顯示第一層子節點', () => {
    // 設定測試資料
    useMindMapStore.getState().loadMindMap(
      [
        {
          id: 'topic',
          type: 'topic',
          position: { x: 0, y: 0 },
          data: { label: 'Topic', topicId: 'topic-1' },
        },
        {
          id: 'child1',
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: 'Child 1' },
        },
        {
          id: 'child2',
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: 'Child 2' },
        },
      ],
      [
        { id: 'e1', source: 'topic', target: 'child1' },
        { id: 'e2', source: 'topic', target: 'child2' },
      ]
    );

    render(<TopicCardView topicId="topic-1" />);

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('顯示 2 個第一層節點')).toBeInTheDocument();
  });

  it('應該可以切換顯示模式', () => {
    useMindMapStore.getState().loadMindMap(
      [
        {
          id: 'topic',
          type: 'topic',
          position: { x: 0, y: 0 },
          data: { label: 'Topic', topicId: 'topic-1' },
        },
        {
          id: 'child1',
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: 'Child 1' },
        },
      ],
      [{ id: 'e1', source: 'topic', target: 'child1' }]
    );

    render(<TopicCardView topicId="topic-1" />);

    // 預設應該是 Grid 模式
    const gridButton = screen.getByText('Grid');
    const listButton = screen.getByText('List');

    // 點擊 List 按鈕
    fireEvent.click(listButton);

    // 驗證 List 按鈕被選中
    expect(listButton.closest('button')).toHaveClass('bg-primary');

    // 點擊 Grid 按鈕
    fireEvent.click(gridButton);

    // 驗證 Grid 按鈕被選中
    expect(gridButton.closest('button')).toHaveClass('bg-primary');
  });

  it('應該可以點擊卡片', () => {
    // Mock console.log
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    useMindMapStore.getState().loadMindMap(
      [
        {
          id: 'topic',
          type: 'topic',
          position: { x: 0, y: 0 },
          data: { label: 'Topic', topicId: 'topic-1' },
        },
        {
          id: 'child1',
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: 'Child 1' },
        },
      ],
      [{ id: 'e1', source: 'topic', target: 'child1' }]
    );

    render(<TopicCardView topicId="topic-1" />);

    // 找到卡片並點擊
    const card = screen.getByText('Child 1').closest('[class*="card"]');
    expect(card).toBeInTheDocument();

    if (card) {
      fireEvent.click(card);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Card clicked:',
        expect.objectContaining({
          id: 'child1',
          data: expect.objectContaining({ label: 'Child 1' }),
        })
      );
    }

    consoleSpy.mockRestore();
  });

  it('應該正確計算子節點數量', () => {
    useMindMapStore.getState().loadMindMap(
      [
        {
          id: 'topic',
          type: 'topic',
          position: { x: 0, y: 0 },
          data: { label: 'Topic', topicId: 'topic-1' },
        },
        {
          id: 'child1',
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: 'Child 1' },
        },
        {
          id: 'child2',
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: 'Child 2' },
        },
        {
          id: 'grandchild1',
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: 'Grandchild 1' },
        },
      ],
      [
        { id: 'e1', source: 'topic', target: 'child1' },
        { id: 'e2', source: 'topic', target: 'child2' },
        { id: 'e3', source: 'child1', target: 'grandchild1' },
      ]
    );

    render(<TopicCardView topicId="topic-1" />);

    // 應該只顯示第一層子節點（2個）
    expect(screen.getByText('顯示 2 個第一層節點')).toBeInTheDocument();
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    // 不應該顯示第二層的節點
    expect(screen.queryByText('Grandchild 1')).not.toBeInTheDocument();
  });
});

/**
 * 視圖切換整合測試
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MindMapEditor } from '@/components/MindMapEditor';
import { useMindMapStore } from '@/stores/mindmapStore';
import { useViewModeStore } from '@/stores/viewModeStore';

describe('視圖切換整合測試', () => {
  beforeEach(() => {
    // 重置 Stores
    useMindMapStore.getState().reset();
    useViewModeStore.getState().reset();

    // 設定測試資料
    useMindMapStore.getState().loadMindMap(
      [
        {
          id: '1',
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: 'Root' },
        },
      ],
      []
    );
  });

  it('應該可以切換到 Outliner 視圖', async () => {
    const user = userEvent.setup();
    render(<MindMapEditor mindmapId="test-1" />);

    // 點擊 Outliner 按鈕
    const outlinerButton = screen.getByText('大綱');
    await user.click(outlinerButton);

    // 等待視圖切換完成（switchView 使用 setTimeout 300ms）
    await waitFor(
      () => {
        expect(screen.getByText('大綱視圖')).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it('應該可以切換到 Logic Chart 視圖', async () => {
    const user = userEvent.setup();
    render(<MindMapEditor mindmapId="test-1" />);

    // 點擊 Logic Chart 按鈕
    const logicChartButton = screen.getByText('邏輯圖');
    await user.click(logicChartButton);

    // 等待視圖切換完成
    await waitFor(
      () => {
        const currentView = useViewModeStore.getState().currentView;
        expect(currentView).toBe('logicChart');
      },
      { timeout: 1000 }
    );
  });

  it('應該儲存視圖偏好', async () => {
    const user = userEvent.setup();
    render(<MindMapEditor mindmapId="test-1" />);

    // 切換視圖
    const outlinerButton = screen.getByText('大綱');
    await user.click(outlinerButton);

    // 等待視圖切換完成（偏好會在 switchView 中立即儲存）
    await waitFor(
      () => {
        const preference = useViewModeStore
          .getState()
          .getViewPreference('test-1');
        expect(preference?.viewMode).toBe('outliner');
      },
      { timeout: 1000 }
    );
  });

  it('應該在重新載入時恢復視圖偏好', async () => {
    // 先設定偏好
    useViewModeStore.getState().saveViewPreference('test-1', 'logicChart');

    // 渲染組件
    render(<MindMapEditor mindmapId="test-1" />);

    // 等待偏好載入
    await waitFor(
      () => {
        const currentView = useViewModeStore.getState().currentView;
        expect(currentView).toBe('logicChart');
      },
      { timeout: 500 }
    );
  });

  it('切換視圖時不應該丟失資料', async () => {
    const user = userEvent.setup();
    const { nodes: initialNodes } = useMindMapStore.getState();

    render(<MindMapEditor mindmapId="test-1" />);

    // 切換到 Outliner
    const outlinerButton = screen.getByText('大綱');
    await user.click(outlinerButton);

    await waitFor(
      () => {
        expect(screen.getByText('大綱視圖')).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // 切換回 Radial
    const radialButton = screen.getByText('放射狀');
    await user.click(radialButton);

    await waitFor(
      () => {
        const { nodes } = useMindMapStore.getState();
        expect(nodes.length).toBe(initialNodes.length);
      },
      { timeout: 1000 }
    );
  });
});

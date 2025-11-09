/**
 * ViewModeStore 單元測試
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useViewModeStore } from '@/stores/viewModeStore';

describe('ViewModeStore', () => {
  beforeEach(() => {
    // 每個測試前重置 Store
    useViewModeStore.getState().reset();
  });

  describe('switchView', () => {
    it('應該正確切換視圖模式', async () => {
      const store = useViewModeStore.getState();

      store.switchView('outliner');

      // 等待切換動畫完成
      await new Promise((resolve) => setTimeout(resolve, 400));

      const currentView = useViewModeStore.getState().currentView;

      expect(currentView).toBe('outliner');
    });

    it('切換時應該設定 isSwitching 狀態', () => {
      const store = useViewModeStore.getState();

      store.switchView('logicChart');

      expect(useViewModeStore.getState().isSwitching).toBe(true);
    });

    it('切換視圖後應該清除 isSwitching 狀態', async () => {
      const store = useViewModeStore.getState();

      store.switchView('outliner');

      // 等待切換動畫完成
      await new Promise((resolve) => setTimeout(resolve, 400));

      expect(useViewModeStore.getState().isSwitching).toBe(false);
    });
  });

  describe('setLayoutDirection', () => {
    it('應該正確設定佈局方向', () => {
      const store = useViewModeStore.getState();

      store.setLayoutDirection('LR');

      expect(useViewModeStore.getState().layoutDirection).toBe('LR');
    });

    it('應該可以切換佈局方向', () => {
      const store = useViewModeStore.getState();

      store.setLayoutDirection('LR');
      store.setLayoutDirection('TB');

      expect(useViewModeStore.getState().layoutDirection).toBe('TB');
    });
  });

  describe('saveViewPreference', () => {
    it('應該儲存視圖偏好', () => {
      const store = useViewModeStore.getState();

      store.saveViewPreference('mindmap-1', 'outliner', 'TB');

      const preference = store.getViewPreference('mindmap-1');

      expect(preference).not.toBeNull();
      expect(preference?.viewMode).toBe('outliner');
      expect(preference?.layoutDirection).toBe('TB');
      expect(preference?.mindmapId).toBe('mindmap-1');
    });

    it('應該覆蓋既有的偏好設定', () => {
      const store = useViewModeStore.getState();

      store.saveViewPreference('mindmap-1', 'radial');
      store.saveViewPreference('mindmap-1', 'outliner');

      const preference = store.getViewPreference('mindmap-1');

      expect(preference?.viewMode).toBe('outliner');
    });

    it('應該可以儲存多個不同 MindMap 的偏好', () => {
      const store = useViewModeStore.getState();

      store.saveViewPreference('mindmap-1', 'radial');
      store.saveViewPreference('mindmap-2', 'outliner');

      const preference1 = store.getViewPreference('mindmap-1');
      const preference2 = store.getViewPreference('mindmap-2');

      expect(preference1?.viewMode).toBe('radial');
      expect(preference2?.viewMode).toBe('outliner');
    });

    it('切換視圖時應該自動儲存偏好', async () => {
      const store = useViewModeStore.getState();

      store.switchView('outliner', 'mindmap-1');

      // 等待切換完成
      await new Promise((resolve) => setTimeout(resolve, 400));

      const preference = store.getViewPreference('mindmap-1');

      expect(preference).not.toBeNull();
      expect(preference?.viewMode).toBe('outliner');
    });
  });

  describe('getViewPreference', () => {
    it('應該返回 null 當偏好不存在時', () => {
      const store = useViewModeStore.getState();

      const preference = store.getViewPreference('non-existent');

      expect(preference).toBeNull();
    });

    it('應該正確取得已儲存的偏好', () => {
      const store = useViewModeStore.getState();

      store.saveViewPreference('mindmap-1', 'logicChart', 'LR');

      const preference = store.getViewPreference('mindmap-1');

      expect(preference).not.toBeNull();
      expect(preference?.viewMode).toBe('logicChart');
      expect(preference?.layoutDirection).toBe('LR');
    });
  });

  describe('clearViewPreference', () => {
    it('應該清除指定的視圖偏好', () => {
      const store = useViewModeStore.getState();

      store.saveViewPreference('mindmap-1', 'outliner');
      store.clearViewPreference('mindmap-1');

      const preference = store.getViewPreference('mindmap-1');

      expect(preference).toBeNull();
    });

    it('清除不存在的偏好不應該出錯', () => {
      const store = useViewModeStore.getState();

      expect(() => {
        store.clearViewPreference('non-existent');
      }).not.toThrow();
    });

    it('應該只清除指定的偏好，不影響其他偏好', () => {
      const store = useViewModeStore.getState();

      store.saveViewPreference('mindmap-1', 'radial');
      store.saveViewPreference('mindmap-2', 'outliner');

      store.clearViewPreference('mindmap-1');

      const preference1 = store.getViewPreference('mindmap-1');
      const preference2 = store.getViewPreference('mindmap-2');

      expect(preference1).toBeNull();
      expect(preference2).not.toBeNull();
      expect(preference2?.viewMode).toBe('outliner');
    });
  });

  describe('reset', () => {
    it('應該重置所有狀態到初始值', () => {
      const store = useViewModeStore.getState();

      store.saveViewPreference('mindmap-1', 'outliner');
      store.switchView('logicChart');
      store.setLayoutDirection('LR');

      store.reset();

      const state = useViewModeStore.getState();

      expect(state.currentView).toBe('radial');
      expect(state.layoutDirection).toBe('TB');
      expect(state.viewPreferences.size).toBe(0);
      expect(state.isSwitching).toBe(false);
    });
  });
});

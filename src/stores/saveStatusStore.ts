/**
 * 儲存狀態管理 Store
 * 追蹤心智圖的儲存狀態
 */

import { create } from 'zustand';

/**
 * 儲存狀態類型
 */
export type SaveStatus = 'saved' | 'saving' | 'error' | 'unsaved';

interface SaveStatusState {
  /** 當前儲存狀態 */
  status: SaveStatus;

  /** 錯誤訊息（如果有） */
  errorMessage: string | null;

  /** 最後儲存時間 */
  lastSavedAt: Date | null;

  /** 設定儲存狀態 */
  setStatus: (status: SaveStatus) => void;

  /** 設定錯誤訊息 */
  setError: (message: string) => void;

  /** 儲存成功 */
  setSaved: () => void;

  /** 重置狀態 */
  reset: () => void;
}

/**
 * 儲存狀態 Store
 */
export const useSaveStatusStore = create<SaveStatusState>((set) => ({
  status: 'saved',
  errorMessage: null,
  lastSavedAt: null,

  setStatus: (status) => set({ status }),

  setError: (message) =>
    set({
      status: 'error',
      errorMessage: message,
    }),

  setSaved: () =>
    set({
      status: 'saved',
      errorMessage: null,
      lastSavedAt: new Date(),
    }),

  reset: () =>
    set({
      status: 'saved',
      errorMessage: null,
      lastSavedAt: null,
    }),
}));

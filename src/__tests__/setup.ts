/**
 * Vitest 測試環境設定檔
 * 設定全域的測試工具和 mock
 */

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// 擴展 Vitest 的 expect 斷言
expect.extend(matchers);

// Mock ResizeObserver（React Flow 需要）
global.ResizeObserver = class ResizeObserver {
  observe() {
    // Mock implementation
  }
  unobserve() {
    // Mock implementation
  }
  disconnect() {
    // Mock implementation
  }
};

// 每個測試後清理 DOM
afterEach(() => {
  cleanup();
});

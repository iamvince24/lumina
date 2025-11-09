/**
 * Vitest 測試配置檔案
 * 設定測試環境、覆蓋率等選項
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // 測試環境設定
    environment: 'jsdom',

    // 全域設定檔
    setupFiles: ['./src/__tests__/setup.ts'],

    // 覆蓋率設定
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
      ],
    },

    // 全域變數
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

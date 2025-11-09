/**
 * 範例測試檔案
 * 驗證測試環境是否正確設定
 */

import { describe, it, expect } from 'vitest';

describe('測試環境驗證', () => {
  it('應該可以執行基本測試', () => {
    expect(1 + 1).toBe(2);
  });

  it('TypeScript 型別應該正常運作', () => {
    const obj: { name: string; age: number } = {
      name: 'Test',
      age: 25,
    };

    expect(obj.name).toBe('Test');
    expect(obj.age).toBe(25);
  });
});

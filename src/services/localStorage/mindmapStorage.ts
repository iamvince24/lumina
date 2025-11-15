/**
 * MindMap localStorage 服務層
 * 負責所有心智圖資料的本地儲存、載入、匯出、匯入等操作
 */

import type { Node, Edge } from '@/types/mindmap';

// ========================================
// 常數定義
// ========================================

const STORAGE_KEY = 'lumina-mindmap';

// ========================================
// 型別定義
// ========================================

/**
 * 儲存在 localStorage 的心智圖資料結構
 */
export interface LocalMindMapData {
  nodes: Node[];
  edges: Edge[];
  createdAt: string; // ISO 8601 格式
  updatedAt: string; // ISO 8601 格式
}

/**
 * 儲存操作的結果
 */
export interface SaveResult {
  success: boolean;
  error?: string;
}

/**
 * localStorage 使用量資訊
 */
export interface StorageUsage {
  used: number; // bytes
  usedMB: number; // MB
  estimatedLimit: number; // bytes (約 5-10MB)
  estimatedLimitMB: number; // MB
  percentage: number; // 使用百分比
}

// ========================================
// 核心功能
// ========================================

/**
 * 儲存心智圖資料到 localStorage
 */
export function saveMindMap(nodes: Node[], edges: Edge[]): SaveResult {
  try {
    const data: LocalMindMapData = {
      nodes,
      edges,
      createdAt: getExistingCreatedAt() || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    return { success: true };
  } catch (error) {
    // 處理 localStorage 寫入錯誤（容量滿、隱私模式等）
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    console.error('Failed to save mindmap to localStorage:', errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 從 localStorage 載入心智圖資料
 * 如果不存在，返回空的資料結構
 */
export function loadMindMap(): LocalMindMapData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      // 首次載入，返回空白心智圖
      const now = new Date().toISOString();
      return {
        nodes: [],
        edges: [],
        createdAt: now,
        updatedAt: now,
      };
    }

    const data = JSON.parse(stored) as LocalMindMapData;

    // 確保資料結構完整
    return {
      nodes: data.nodes || [],
      edges: data.edges || [],
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to load mindmap from localStorage:', error);

    // 載入失敗時返回空白心智圖
    const now = new Date().toISOString();
    return {
      nodes: [],
      edges: [],
      createdAt: now,
      updatedAt: now,
    };
  }
}

/**
 * 清除心智圖資料
 */
export function clearMindMap(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear mindmap from localStorage:', error);
  }
}

// ========================================
// 匯出/匯入功能
// ========================================

/**
 * 匯出心智圖為 JSON 檔案（觸發下載）
 */
export function exportMindMapJSON(): void {
  try {
    const data = loadMindMap();

    // 建立可讀性更好的 JSON 格式
    const jsonString = JSON.stringify(data, null, 2);

    // 建立 Blob 物件
    const blob = new Blob([jsonString], { type: 'application/json' });

    // 建立下載連結
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lumina-mindmap-${new Date().toISOString().split('T')[0]}.json`;

    // 觸發下載
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 清理 URL
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export mindmap:', error);
    throw new Error('匯出失敗，請稍後再試');
  }
}

/**
 * 匯入 JSON 檔案並替換現有資料
 */
export function importMindMapJSON(file: File): Promise<SaveResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as LocalMindMapData;

        // 驗證資料結構
        if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
          resolve({
            success: false,
            error: '無效的檔案格式',
          });
          return;
        }

        // 儲存匯入的資料
        const result = saveMindMap(data.nodes, data.edges);
        resolve(result);
      } catch (error) {
        console.error('Failed to import mindmap:', error);
        resolve({
          success: false,
          error: '檔案解析失敗',
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: '檔案讀取失敗',
      });
    };

    reader.readAsText(file);
  });
}

// ========================================
// 工具函數
// ========================================

/**
 * 取得現有的 createdAt 時間戳（避免覆蓋）
 */
function getExistingCreatedAt(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored) as LocalMindMapData;
    return data.createdAt || null;
  } catch {
    return null;
  }
}

/**
 * 計算 localStorage 使用量
 */
export function getStorageUsage(): StorageUsage {
  try {
    // 計算所有 lumina 相關的 key 使用量
    let totalBytes = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('lumina')) {
        const value = localStorage.getItem(key);
        if (value) {
          // 計算 key + value 的大小（字元數 * 2 bytes for UTF-16）
          totalBytes += (key.length + value.length) * 2;
        }
      }
    }

    // localStorage 限制通常是 5-10MB，這裡估計 5MB
    const estimatedLimit = 5 * 1024 * 1024; // 5MB in bytes

    return {
      used: totalBytes,
      usedMB: parseFloat((totalBytes / (1024 * 1024)).toFixed(2)),
      estimatedLimit,
      estimatedLimitMB: parseFloat((estimatedLimit / (1024 * 1024)).toFixed(2)),
      percentage: parseFloat(((totalBytes / estimatedLimit) * 100).toFixed(2)),
    };
  } catch (error) {
    console.error('Failed to calculate storage usage:', error);

    return {
      used: 0,
      usedMB: 0,
      estimatedLimit: 5 * 1024 * 1024,
      estimatedLimitMB: 5,
      percentage: 0,
    };
  }
}

/**
 * 檢查是否有儲存的心智圖資料
 */
export function hasMindMapData(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;

    const data = JSON.parse(stored) as LocalMindMapData;
    return data.nodes.length > 0 || data.edges.length > 0;
  } catch {
    return false;
  }
}

/**
 * 服務層配置
 * 用於控制是否使用 Mock 資料或真實 API
 */

/**
 * 環境變數：控制是否使用 Mock 資料
 * - 'true': 使用 Mock 資料（開發階段）
 * - 'false': 使用真實 API（生產環境）
 *
 * 可以在 .env.local 中設定：
 * NEXT_PUBLIC_USE_MOCK_DATA=true
 */
export const USE_MOCK_DATA =
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ||
  process.env.NODE_ENV === 'development';

/**
 * API 基礎路徑
 * 未來串接真實 API 時使用
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

/**
 * tRPC 端點
 * 未來使用 tRPC 時的端點配置
 */
export const TRPC_ENDPOINT =
  process.env.NEXT_PUBLIC_TRPC_ENDPOINT || '/api/trpc';

/**
 * Mock 延遲時間（毫秒）
 * 模擬網絡請求延遲
 */
export const MOCK_DELAY = 300;

// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// 讀取 .env.local 檔案中的環境變數
dotenv.config({ path: '.env.local' });

// 確保 DIRECT_URL 存在，否則拋出錯誤提醒
if (!process.env.DIRECT_URL) {
  throw new Error('DIRECT_URL is not defined in .env.local');
}

export default defineConfig({
  schema: './lib/db/schema.ts', // 指定 Schema 檔案位置
  out: './drizzle', // Migration 檔案輸出位置
  dialect: 'postgresql', // 指定資料庫類型
  dbCredentials: {
    // ⚠️ 注意：這裡必須使用 DIRECT_URL (Port 5432)
    // 因為執行 Schema 變更時不能透過 Transaction Pooler
    url: process.env.DIRECT_URL,
  },
});
